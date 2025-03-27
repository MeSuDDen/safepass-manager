import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Логирование токенов из куки
    const accessToken = request.cookies['accessToken'];
    const refreshToken = request.cookies['refreshToken'];

    console.log('Received accessToken:', accessToken);
    console.log('Received refreshToken:', refreshToken);

    if (!accessToken) {
      console.log('No accessToken found in cookies.');

      if (!refreshToken) {
        console.log('No refreshToken found in cookies.');
        throw new UnauthorizedException('Нет токенов. Авторизуйтесь заново.');
      }
      return this.refreshAccessToken(refreshToken, request, response);
    }

    try {
      console.log('Validating accessToken...');
      const payload = this.jwtService.verify(accessToken, { secret: process.env.JWT_ACCESS_SECRET });
      console.log('AccessToken validated. Payload:', payload);
      request.user = payload;
      return true;
    } catch (error) {
      console.log('AccessToken validation failed:', error.message);

      if (!refreshToken) {
        console.log('No refreshToken found, cannot refresh access token.');
        throw new UnauthorizedException('Срок действия AccessToken истёк, а RefreshToken отсутствует.');
      }
      return this.refreshAccessToken(refreshToken, request, response);
    }
  }

  private async refreshAccessToken(refreshToken: string, request: Request, response: Response): Promise<boolean> {
    console.log('Attempting to refresh access token with refreshToken:', refreshToken);

    let decoded;
    try {
      console.log('Verifying refreshToken...');
      decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,  // Убедись, что это секрет для refreshToken
      });
      console.log('refreshToken verified. Decoded:', decoded);
    } catch (error) {
      console.log('refreshToken verification failed:', error.message);
      throw new UnauthorizedException('Неверный RefreshToken');
    }

    if (!decoded) {
      console.log('Decoded refreshToken is null or undefined.');
      throw new UnauthorizedException('Неверный RefreshToken');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: decoded.sub },
      include: { tokens: true },
    });

    if (!user || !user.tokens?.refreshToken) {
      console.log('User not found or refreshToken mismatch.');
      throw new UnauthorizedException('Пользователь не найден или RefreshToken не совпадает.');
    }

    const isValidRefresh = await bcrypt.compare(refreshToken, user.tokens.refreshToken);
    if (!isValidRefresh) {
      console.log('RefreshToken is invalid.');
      throw new UnauthorizedException('RefreshToken недействителен.');
    }

    // Генерируем новый Access Token
    const newAccessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }
    );

    console.log('Generated new accessToken:', newAccessToken);

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Должно быть true в проде
      sameSite: 'lax',
    });

    request.user = { sub: user.id, email: user.email };
    return true;
  }
}
