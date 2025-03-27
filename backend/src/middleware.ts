import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

interface AuthRequest extends Request {
  user?: { id: string }; // или соответствующая структура пользователя
}

@Injectable()
export class MasterPasswordMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException('Пользователь не найден');

    const userTokens = await this.prisma.userTokens.findUnique({
      where: { userId },
    });

    if (!userTokens || !userTokens.isMasterPasswordVerified) {
      throw new UnauthorizedException('Мастер-пароль не подтвержден');
    }

    next();
  }
}
