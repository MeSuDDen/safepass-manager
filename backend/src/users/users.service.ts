import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

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

async getStatsForAdminDashboard(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpException(req, 401);
  }

  const userId = req.user.id;
  console.log(`Пользователь с id: ${userId} запрашивает статистику`);

  // Текущие метрики
  const totalUsersCount = await this.prismaService.user.findMany();
  const adminUsersCount = await this.prismaService.user.findMany({
    where: { role: "admin" },
  });
  const blockUsersCount = await this.prismaService.user.findMany({
    where: { block: true },
  });
  const newUsersCount = await this.prismaService.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Последние 24 часа
      },
    },
  });

  // Даты начала и конца прошлого месяца
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  // Данные за прошлый месяц
  const previousTotalUsersCount = await this.prismaService.user.findMany({
    where: {
      createdAt: {
        lte: lastMonthEnd,
      },
    },
  });

  const previousAdminUsersCount = await this.prismaService.user.findMany({
    where: {
      role: "admin",
      createdAt: {
        lte: lastMonthEnd,
      },
    },
  });

  const previousBlockUsersCount = await this.prismaService.user.findMany({
    where: {
      block: true,
      createdAt: {
        lte: lastMonthEnd,
      },
    },
  });

  const previousNewUsersCount = await this.prismaService.user.findMany({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  // Явно указываем тип для массива
  const monthlyNewUsers: { month: string; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));

    const newUsersCount = await this.prismaService.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    monthlyNewUsers.push({
      month: monthStart.toLocaleString("default", { month: "short" }), // "Jan", "Feb" и т. д.
      count: newUsersCount,
    });
  }

  return {
    totalUsersCount,
    previousTotalUsersCount,
    adminUsersCount,
    previousAdminUsersCount,
    blockUsersCount,
    previousBlockUsersCount,
    newUsersCount,
    previousNewUsersCount,
    monthlyNewUsers
  };
}

}
