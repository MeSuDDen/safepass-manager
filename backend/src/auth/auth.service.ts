import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Tokens } from './types';
import { loginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // Регистрация пользователя
  async signUp(registerDto: RegisterDto) {
    if (!registerDto.agree) {
      throw new BadRequestException('Вы должны согласиться с условиями.');
    }

    if (registerDto.masterPassword !== registerDto.confirmMasterPassword) {
      throw new BadRequestException('Пароли не совпадают.');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Пользователь с такой почтой уже существует!');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const hashedMasterPassword = await this.hashPassword(registerDto.masterPassword);
    const emailConfirmCode = crypto.randomInt(100000, 999999).toString();
    const randomToken = crypto.randomBytes(32).toString('hex');
    const emailHash = crypto.createHash('sha256')
      .update(registerDto.email + randomToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const role = registerDto.role ?? 'user'; // Если роль не указана, назначаем 'user'

    await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        role, // Устанавливаем роль
        passwords: {
          create: {
            password: hashedPassword,
            masterPassword: hashedMasterPassword,
          },
        },
        emailVerification: {
          create: {
            code: emailConfirmCode,
            hash: emailHash,
            expiresAt,
          },
        },
      },
    });

    await this.emailService.sendConfirmationEmail(registerDto.email, emailConfirmCode, emailHash);

    return {
      message: 'Пользователь успешно зарегистрирован, проверьте почту для подтверждения',
      emailVerificationHash: emailHash,
    };
  }


  async correctHash(hash: string, code: string, res: Response ) : Promise<Tokens> {
    const emailVerification = await this.prismaService.emailVerification.findUnique({
      where: { hash, code },
      include: { user: true },
    });

    if (!emailVerification || emailVerification.expiresAt < new Date()) {
      if (emailVerification) {
        await this.prismaService.emailVerification.delete({ where: { id: emailVerification.id } });
      }
      throw new BadRequestException('Неверный код подтверждения или он истёк.');
    }

    // Обновляем статус email-верификации
    await this.prismaService.user.update({
      where: { id: emailVerification.userId },
      data: { emailVerified: true, lastLoginAt: new Date() },
    });

    // Генерируем JWT-токены
    const tokens = await this.getTokens(emailVerification.user.id, emailVerification.user.email, emailVerification.user.role);
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    // Сохраняем refreshToken в БД
    await this.prismaService.userTokens.upsert({
      where: { userId: emailVerification.user.id },
      update: { refreshToken: hashedRefreshToken },
      create: { userId: emailVerification.user.id, refreshToken: hashedRefreshToken },
    });

    await this.prismaService.emailVerification.delete({
      where: { id: emailVerification.id }
    })

    // **Устанавливаем токены в куки**
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,  // Доступен только серверу (защита от XSS)
      secure: false,     // Только HTTPS (отключить в dev-режиме)
      sameSite: 'lax',  // Lax: защита от CSRF
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return tokens;
  }



  async findUserByHash(hash: string) {
    // Поиск пользователя по хэшу
    const user = await this.prismaService.emailVerification.findUnique({
      where: {
        hash: hash,  // Используем поле hash
      },
      include: {
        user: true,
      },
    });
    // Если пользователь не найден, возвращаем null
    if (!user) {
      throw new NotFoundException('Хэш не найден');
    }
    if (user.expiresAt < new Date()) {
      throw new BadRequestException('Ссылка устарела');
    }
    // Если пользователь найден, возвращаем его
    return { valid: true, user };
  }


  async signIn(dto: loginDto, response: Response): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      include: { passwords: true, tokens: true },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');
    if (!user.passwords || !user.passwords.password) {
      throw new UnauthorizedException('Данные учетной записи отсутствуют');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwords.password);
    if (!passwordValid) throw new UnauthorizedException('Неверный пароль');

    // Проверяем, не заблокирован ли аккаунт
    if (user.tokens && user.tokens.failedMasterPasswordAttempts >= 5) {
      throw new UnauthorizedException(
        'Аккаунт заблокирован из-за многократных неудачных попыток ввода мастер-пароля'
      );
    }

    // Генерируем токены
    console.log('Данные пользователя перед созданием токена:', user);
    const tokens = await this.getTokens(user.id, user.email, user.role);
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    await this.prismaService.userTokens.upsert({
      where: { userId: user.id },
      include: { user: true },
      update: {
        user: {
          update:{
            lastLoginAt: new Date(),
          },
        },
        refreshToken: hashedRefreshToken,
        isMasterPasswordVerified: false, // После логина сбрасываем 2FA
        failedMasterPasswordAttempts: 0, // Сбрасываем счетчик попыток
      },
      create: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        isMasterPasswordVerified: false,
      },
    });

    // Устанавливаем токены в cookies
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,  // Доступен только серверу (защита от XSS)
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'strict',  // Защита от CSRF
    });

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return tokens;
  }


  async verifyMasterPassword(dto: { email: string; masterPassword: string }): Promise<{ message: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      include: { passwords: true, tokens: true },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');
    if (!user.passwords || !user.passwords.masterPassword) {
      throw new UnauthorizedException('Мастер-пароль отсутствует');
    }

    const masterPasswordValid = await bcrypt.compare(dto.masterPassword, user.passwords.masterPassword);

    if (!masterPasswordValid) {
      const failedAttempts = (user.tokens?.failedMasterPasswordAttempts || 0) + 1;

      if (failedAttempts >= 5) {
        throw new UnauthorizedException('Аккаунт заблокирован из-за 5 неудачных попыток');
      }

      await this.prismaService.userTokens.update({
        where: { userId: user.id },
        data: { failedMasterPasswordAttempts: failedAttempts },
      });

      throw new UnauthorizedException('Неверный мастер-пароль');
    }

    await this.prismaService.userTokens.update({
      where: { userId: user.id },
      data: { isMasterPasswordVerified: true, failedMasterPasswordAttempts: 0 },
    });

    return { message: 'Мастер-пароль успешно подтвержден' };
  }




// Запрос на сброс пароля
  async requestPasswordReset(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Очищаем просроченные запросы на сброс пароля
    await this.prismaService.passwordReset.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    const code = crypto.randomInt(100000, 999999).toString();
    const randomToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(email + randomToken).digest('hex');

    await this.prismaService.passwordReset.upsert({
      where: { userId: user.id },
      update: { code, hash, isVerified: false, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      create: { userId: user.id, code, hash, isVerified: false, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });

    await this.emailService.sendPasswordResetEmail(email, code, `https://yourdomain.com/reset-password/${hash} Код активен 30 минут`);
    return { message: 'Письмо с инструкцией отправлено' };
  }


  // Проверка кода сброса пароля
  async verifyResetCode(hash: string, code: string) {
    const resetRequest = await this.prismaService.passwordReset.findUnique({ where: { hash } });

    if (!resetRequest || resetRequest.code !== code) {
      throw new BadRequestException('Неверный код сброса');
    }

    if (resetRequest.expiresAt < new Date()) {
      await this.prismaService.passwordReset.delete({ where: { id: resetRequest.id } });
      throw new BadRequestException('Время сброса пароля истекло, запросите сброс снова');
    }

    // Помечаем запрос как подтвержденный
    await this.prismaService.passwordReset.update({
      where: { id: resetRequest.id },
      data: { isVerified: true },
    });

    return { message: 'Код подтвержден', redirect: `https://yourdomain.com/reset-password/new-password?hash=${hash}` };
  }


  // Установка нового пароля
  async resetPassword(hash: string, newPassword: string) {
    const resetRequest = await this.prismaService.passwordReset.findUnique({ where: { hash } });

    if (!resetRequest) throw new BadRequestException('Недействительный запрос');
    if (!resetRequest.isVerified) throw new ForbiddenException('Подтвердите код перед сменой пароля');
    if (resetRequest.expiresAt < new Date()) {
      await this.prismaService.passwordReset.delete({ where: { id: resetRequest.id } });
      throw new BadRequestException('Время сброса пароля истекло, запросите сброс снова');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prismaService.user.update({
      where: { id: resetRequest.userId },
      data: { passwords: { update: { password: hashedPassword } } }
    });

    await this.prismaService.passwordReset.delete({ where: { id: resetRequest.id } });

    return { message: 'Пароль успешно изменен' };
  }


  // Генерация JWT-токенов
  async getTokens(userId: string, email: string, role: string): Promise<Tokens> {
    console.log('Создаём токен с ролью:', { userId, email, role });

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role, // <-- Должно быть тут!
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES'),
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role, // <-- И тут!
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);

    return { accessToken: at, refreshToken: rt };
  }




  // Обновление Access Token с помощью Refresh Token
  async refreshAccessToken(userId: string, refreshToken: string): Promise<Tokens> {
    // Находим пользователя и его токены
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: { tokens: true }, // Загружаем токены
    });

    console.log("Токен из запроса:", refreshToken);
    console.log("Токен из базы данных:", user?.tokens?.refreshToken);

    if (!user || !user.tokens?.refreshToken) {
      throw new UnauthorizedException('Доступ запрещён');
    }

    // Проверяем совпадение refresh-токена
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.tokens.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Неверный Refresh Token');
    }

    // Генерация нового Access и Refresh токенов
    const tokens = await this.getTokens(user.id, user.email, user.role);

    // Хэширование нового Refresh Token
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    // Обновляем refreshToken в базе данных
    await this.prismaService.userTokens.update({
      where: { userId: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Возвращаем новые токены
    return tokens;
  }

  // async logout(userId: string) {
  //   await this.prismaService.userTokens.deleteMany({ where: { userId } });
  //   return { message: 'Вы вышли из системы' };
  // }

  async logout(refreshToken: string): Promise<void> {
    await this.prismaService.userTokens.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
  }

  // Хэширование пароля
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(refreshToken, salt);
  }

}