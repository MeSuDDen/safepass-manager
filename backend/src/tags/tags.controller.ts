import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { TagsService } from './tags.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: { id: string }; // добавь другие поля, если нужно
}

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId') // Добавляем параметр userId в URL
  async getTags(@Param('userId') userId: string) {
    return this.tagsService.getAllTags(userId);
  }
}
