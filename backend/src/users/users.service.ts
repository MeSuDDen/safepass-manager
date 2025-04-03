import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Указываем, что user может быть неопределен
}

@Injectable()
export class UsersService {
 constructor(
   private prismaService: PrismaService,
 ) {}

async getFullUsers(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpException(req, 401); // Можно заменить на HttpException
  }

  const userId = req.user.id
  console.log(`Пользователь с id: ${userId} запрашивает список пользователей`);

  return this.prismaService.user.findMany(
    {
      include: { profile: true },
    }
  );
 }

  async getFullAdminUsers(req: AuthenticatedRequest) {
    if (!req.user) {
      throw new HttpException(req, 401); // Можно заменить на HttpException
    }

    const userId = req.user.id
    console.log(`Пользователь с id: ${userId} запрашивает список пользователей`);

    return this.prismaService.user.findMany(
      {
        where: {
          role: 'admin',
        },
        include: { profile: true },
      }
    );
  }
}
