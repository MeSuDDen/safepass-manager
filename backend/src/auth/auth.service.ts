import {
  BadRequestException,
  ConflictException, ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Res } from '@nestjs/common'
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
    // Проверка уникальности email
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Пользователь с такой почтой уже существует!');
    }

    // Хэширование паролей
    const hashedPassword = await this.hashPassword(registerDto.password);
    const hashedMasterPassword = await this.hashPassword(registerDto.masterPassword);

    // Генерация кода подтверждения email
    const emailConfirmCode = crypto.randomInt(100000, 999999).toString();
    const randomToken = crypto.randomBytes(32).toString('hex'); // Генерация случайного токена
    const emailHash = crypto.createHash('sha256')
      .update(registerDto.email + randomToken) // Добавляем случайный токен
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Создание пользователя в базе данных
    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        role: 'user',
        credentials: {
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

    // Отправка кода подтверждения на email
    await this.emailService.sendConfirmationEmail(registerDto.email, emailConfirmCode, emailHash);
    return { message: 'Пользователь успешно зарегистрирован, проверьте почту для подтверждения' };
  }

  // Подтверждение email по коду

async correctHash(hash: string, code: string, res: Response ) : Promise<Tokens> {
  const emailVerification = await this.prismaService.emailVerification.findUnique({
    where: { hash, code },
    include: { user: true },
  });

  if (!emailVerification || emailVerification.expiresAt < new Date()) {
    throw new BadRequestException('Неверный код подтверждения или он истёк.');
  }

  // Обновляем статус email-верификации
  await this.prismaService.user.update({
    where: { id: emailVerification.userId },
    data: { emailVerified: true, lastLoginAt: new Date() },
  });

  // Генерируем JWT-токены
  const tokens = await this.getTokens(emailVerification.user.id, emailVerification.user.email);
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

  console.log('Почта подтверждена, токены сохранили')
  return tokens
}

  async signIn(dto: loginDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      include: { credentials: true },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');
    if (!user.credentials || !user.credentials.password) {
      throw new UnauthorizedException('Данные учетной записи отсутствуют');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.credentials.password);
    if (!passwordValid) throw new UnauthorizedException('Неверный пароль');

    const tokens = await this.getTokens(user.id, user.email);
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    await this.prismaService.userTokens.upsert({
      where: { userId: user.id },
      update: { refreshToken: hashedRefreshToken },
      create: { userId: user.id, refreshToken: hashedRefreshToken },
    });

    return tokens;
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
      update: { code, hash, isVerified: false, expiresAt: new Date(Date.now() + 60 * 1000) },
      create: { userId: user.id, code, hash, isVerified: false, expiresAt: new Date(Date.now() + 60 * 1000) },
    });

    await this.emailService.sendPasswordResetEmail(email, code, `https://yourdomain.com/reset-password/${hash} Код активен 1 час`);
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
      data: { credentials: { update: { password: hashedPassword } } }
    });

    await this.prismaService.passwordReset.delete({ where: { id: resetRequest.id } });

    return { message: 'Пароль успешно изменен' };
  }


  // Генерация JWT-токенов
  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES')
        },
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt
    }
}

  // Обновление Access Token с помощью Refresh Token
  async refreshAccessToken(userId: string, refreshToken: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: { tokens: true }, // Загружаем токены
    });

    if (!user || !user.tokens?.refreshToken) throw new UnauthorizedException('Доступ запрещён');

    // Проверяем совпадение refresh-токена
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.tokens.refreshToken);
    if (!isRefreshTokenValid) throw new UnauthorizedException('Неверный Refresh Token');

    const tokens = await this.getTokens(user.id, user.email);
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    await this.prismaService.userTokens.update({
      where: { userId: user.id },
      data: { refreshToken: hashedRefreshToken },
    });



    return tokens;
  }

  async logout(userId: string) {
    await this.prismaService.userTokens.deleteMany({ where: { userId } });
    return { message: 'Вы вышли из системы' };
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