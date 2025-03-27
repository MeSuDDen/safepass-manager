import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('secure-endpoint')
export class SecureController {
  @UseGuards(AuthGuard('jwt')) // Добавляем защиту JWT
  @Get('protected-data')
  getProtectedData() {
    return { message: 'Доступ разрешен' };
  }
}
