import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CredentialsService {
  constructor(private prisma: PrismaService) {}

  async getAllByUser(userId: string) {
    return  this.prisma.userCredentials.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { Tag: true }, // Подключаем теги
    });
  }

}
