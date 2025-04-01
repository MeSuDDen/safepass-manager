import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async getAllByUser(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      include: {
        userCredentials: {
          include: {
            Tag: true, // Все теги учетных записей пользователя
          },
        },
      },
    });
  }
}
