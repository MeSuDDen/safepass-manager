import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getAllTags(userId: string) {
    // Сначала находим все UserCredentials для пользователя
    const credentials = await this.prisma.userCredentials.findMany({
      where: { userId: userId },
      select: {
        Tag: {
          select: { name: true }, // Выбираем только поле name из Tag
        },
      },
    });

    // Извлекаем все уникальные теги
    const tags = credentials.flatMap((cred) => cred.Tag);

    // Возвращаем уникальные теги по имени
    return [...new Set(tags.map((tag) => tag.name))];
  }

}
