import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Param,
  Post,
  Query, UseGuards,
  UsePipes,
  Request,
  ValidationPipe, Req, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyCodeDto } from './dto/auth.dto';
import { ValidationError } from 'class-validator';
import { RefreshTokenGuard } from './refresh-token.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '@prisma/client';
import { loginDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';

interface CustomRequest extends Request {
  user: { id: string; refreshToken: string }; // Укажите типы данных, которые ожидаются в user
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Регистрация нового пользователя
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.signUp(registerDto);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error instanceof ValidationError ? error : new BadRequestException('Ошибка при регистрации');
    }
  }

  // Подтверждение email с кодом

  @Post('email-verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyEmail(@Query('hash') hash: string, @Body() body: VerifyCodeDto, @Res({ passthrough: true }) res: Response) : Promise<Tokens> {
    try {
      return await this.authService.correctHash(hash, body.code, res);
    } catch (error) {
      console.error('Ошибка подтверждения email:', error);
      throw error instanceof HttpException ? error : new BadRequestException('Ошибка при подтверждении email');
    }
  }


// Запрос на сброс пароля
  @Post('reset-password/request')
  async requestPasswordReset(@Body() body: { email: string }) {
    try {
      return await this.authService.requestPasswordReset(body.email);
    } catch (error) {
      console.error('Ошибка запроса сброса пароля:', error);
      throw new BadRequestException('Ошибка при запросе сброса пароля');
    }
  }

  // Подтверждение кода для сброса пароля
  @Post('reset-password/verify/:hash')
  async verifyResetCode(@Param('hash') hash: string, @Body() body: { code: string }) {
    try {
      return await this.authService.verifyResetCode(hash, body.code);
    } catch (error) {
      console.error('Ошибка подтверждения кода сброса пароля:', error);
      throw new BadRequestException('Ошибка при подтверждении кода');
    }
  }

  // Установка нового пароля
  @Post('reset-password/new-password/:hash')
  async resetPassword(@Param('hash') hash: string, @Body() body: { newPassword: string }) {
    try {
      return await this.authService.resetPassword(hash, body.newPassword);
    } catch (error) {
      console.error('Ошибка установки нового пароля:', error);
      throw new BadRequestException('Ошибка при установке нового пароля');
    }
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req:CustomRequest) {
    const user = req.user;
    console.log(user.id, user.refreshToken)
    return this.authService.refreshAccessToken(user['sub'], user['refreshToken']);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: CustomRequest, @Res() res: Response) {
    const user = req.user;
    await this.authService.logout(user['sub']);
    return res.json({ message: 'Вы вышли из системы' });
  }


  @Post('login')
  @HttpCode(200) // Убираем авто-201 ответ
  async login(@Body() dto: loginDto) : Promise<Tokens> {
    return  this.authService.signIn(dto);
  }
}