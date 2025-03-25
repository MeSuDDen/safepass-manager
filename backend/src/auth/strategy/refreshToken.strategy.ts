import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });

  }

  async validate(req: Request, payload: { id: string; email: string }) {
    console.log('Payload:', payload);
    // Проверка заголовка
    const authHeader = req.get('authorization');
    console.log('Authorization заголовок:', authHeader)
    if (!authHeader) {
      throw new UnauthorizedException('Отсутствует заголовок Authorization');
    }

    // Проверка заголовка в Bearer
    const refreshToken = authHeader.replace('Bearer', '').trim();
    console.log('Извлеченный Refresh Token:', refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('Отсутствует refreshToken');
    }

    // Получаем хешированный токен из базы данных
    const userToken = await this.prisma.userTokens.findFirst({
      where: {
        userId: payload.id,
      },
    });

    if (!userToken || !userToken.refreshToken) {
      throw new UnauthorizedException('Пользователь не найден или токен неверен');
    }

    console.log('Refresh Token из БД:', userToken?.refreshToken);

    // Сравнение переданного refreshToken с хешированным токеном в базе данных
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, userToken.refreshToken);

    console.log('Сравнение токенов:', isRefreshTokenValid);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Неверный Refresh Token');
    }

    return { ...payload, refreshToken };
  }

}

