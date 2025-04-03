import { Controller, Get, UseGuards, Req, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenStrategy } from '../auth/strategy';

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Указываем, что user может быть неопределен
}

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService,
              protected usersService: UsersService,) {}


  // Получаем всех пользователей
  @UseGuards(AccessTokenStrategy, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllUsers(@Req() req: AuthenticatedRequest) {
    return this.usersService.getFullUsers(req);
  }

  @UseGuards(AccessTokenStrategy, RolesGuard) // Защищаем JWT + проверяем роль
  @Roles('admin') // Указываем, что маршрут доступен только admin
  @Get('admin')
  async getAdminUsers(@Req() req: AuthenticatedRequest) {
    return this.usersService.getFullAdminUsers(req);
  }
}
