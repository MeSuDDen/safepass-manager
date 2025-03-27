// jwt-cookie.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    console.log(req.cookies);  // Добавь это для проверки cookies в запросе

    const token = req.cookies?.accessToken; // Проверка имени куки

    if (!token) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    try {
      req.user = this.jwtService.verify(token);
      return true;
    } catch (e) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

}