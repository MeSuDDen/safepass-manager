import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = super.canActivate(context);

    // Преобразуем Observable<boolean> в Promise<boolean>, если необходимо
    const isAllowed = canActivate instanceof Observable ? await lastValueFrom(canActivate) : canActivate;

    const request = context.switchToHttp().getRequest();
    console.log('User in JwtAuthGuard after super.canActivate:', request.user);

    return isAllowed;
  }
}
