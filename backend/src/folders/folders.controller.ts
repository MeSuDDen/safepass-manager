import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('folders')
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getFolders(@Param('userId') userId: string) {
    return this.foldersService.getAllByUser(userId);
  }
}
