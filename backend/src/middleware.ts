import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

interface AuthRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class TokenRefreshMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware: Проверка токенов');

    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      console.log('Refresh token отсутствует, запрос без авторизации');
      return next(); // Если нет refreshToken, просто пропускаем дальше (неавторизованный пользователь)
    }

    try {
      // Проверяем Access Token, если он есть
      if (accessToken) {
        console.log('Проверяем accessToken');
        try {
          const decoded = this.jwtService.verify(accessToken, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          });

          req.user = { id: decoded.sub };
          return next(); // Токен валиден, пропускаем запрос дальше
        } catch (err) {
          console.log('AccessToken истек, пробуем обновить...');
        }
      }

      // Декодируем refreshToken без верификации, чтобы получить userId
      const decodedRefresh = jwt.decode(refreshToken) as { sub: string, exp: number };

      if (!decodedRefresh || !decodedRefresh.sub) {
        throw new UnauthorizedException('Неверный Refresh Token');
      }

      // Проверяем, не истёк ли refreshToken
      if (decodedRefresh.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Refresh Token истёк');
      }

      // Верифицируем refreshToken
      const refreshPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // Проверяем refreshToken в базе
      const userToken = await this.prismaService.userTokens.findFirst({
        where: { userId: refreshPayload.sub },
      });

      if (!userToken || !userToken.refreshToken) {
        throw new UnauthorizedException('Refresh Token отсутствует в базе');
      }

      // Сравниваем полученный refreshToken с хранящимся в БД
      const isValid = await bcrypt.compare(refreshToken, userToken.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Неверный refresh token');
      }

      console.log('Refresh token прошел проверку, создаем новые токены');

      // Генерируем новые токены
      const newAccessToken = this.jwtService.sign(
        { sub: refreshPayload.sub },
        { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES') }
      );

      const newRefreshToken = this.jwtService.sign(
        { sub: refreshPayload.sub },
        { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES') } // Например, 7 дней
      );

      // Хэшируем новый refreshToken перед записью в БД
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      // Обновляем refreshToken в базе
      await this.prismaService.userTokens.update({
        where: { userId: refreshPayload.sub },
        data: { refreshToken: hashedRefreshToken },
      });

      // Устанавливаем новые токены в куки
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

      req.cookies.accessToken = newAccessToken;
      req.cookies.refreshToken = newRefreshToken;
      req.user = { id: refreshPayload.sub };

      console.log('Новый accessToken и refreshToken установлены');
      return next();
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.status(401).json({ message: 'Ошибка обновления токена' });
    }
  }
}
