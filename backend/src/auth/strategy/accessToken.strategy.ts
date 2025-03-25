import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),  // Используем секрет, полученный из конфигурации
    });
  }

  async validate(payload: JwtPayload) {
    console.log('Payload:', payload);

    if (!payload.sub) {
      throw new UnauthorizedException('Некорректный токен');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub }, // Теперь ищем по `sub`
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }


}
