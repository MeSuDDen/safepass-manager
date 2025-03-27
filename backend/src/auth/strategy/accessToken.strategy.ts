import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: string;  // ID пользователя
  email: string;  // Электронная почта
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken, // Получаем токен из кук
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('Payload:', payload);

    if (!payload.sub) {
      throw new UnauthorizedException('Некорректный токен');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub }, // Ищем пользователя по `sub`
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
