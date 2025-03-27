import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Param,
  Post,
  Query, UseGuards,
  UsePipes,
  ValidationPipe, Req, Res, HttpCode, HttpStatus, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { Get, UseInterceptors } from '@nestjs/common';
import { MasterPasswordMiddleware } from 'src/middleware';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyCodeDto } from './dto/auth.dto';
import { ValidationError } from 'class-validator';
import { loginDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { JwtCookieGuard } from './jwt-cookie.guard';
import * as cookieParser from 'cookie-parser';

interface CustomRequest extends Request {
  user: { id: string; refreshToken: string }; // Укажите типы данных, которые ожидаются в user
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private prismaService:PrismaService) {}

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

  // @Post('email-verify')
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async verifyEmail(@Query('hash') hash: string, @Body() body: VerifyCodeDto, @Res({ passthrough: true }) res: Response) : Promise<Tokens> {
  //   try {
  //     return await this.authService.correctHash(hash, body.code, res);
  //   } catch (error) {
  //     console.error('Ошибка подтверждения email:', error);
  //     throw error instanceof HttpException ? error : new BadRequestException('Ошибка при подтверждении email');
  //   }
  // }

  // @Get('verify-email/:hash')
  // async checkEmailHash(@Param('hash') hash: string): Promise<{ message: string }> {
  //   const user = await this.authService.findUserByHash(hash);
  //
  //   if (!user) {
  //     throw new NotFoundException('Хэш не найден');
  //   }
  //
  //   return { message: 'Хэш найден, можно ввести код' };
  // }
  // В вашем EmailController
  @Get('verify-email/:hash')
  async verifyEmailHash(
    @Param('hash') hash: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.findUserByHash(hash);

    if (!result.valid) {
      // Отправляем детализированные ошибки
      throw new HttpException({result}, 400);
    }

    return res.status(200).json({ success: true });
  }

// POST-запрос для проверки кода
  @Post('verify-email/:hash')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyEmail(
    @Param('hash') hash: string,
    @Body() body: VerifyCodeDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<Tokens> {  // Вернем Tokens, так как correctHash возвращает Tokens
    const user = await this.authService.findUserByHash(hash);

    if (!user) {
      throw new NotFoundException('Хэш не найден');
    }

    try {
      return await this.authService.correctHash(hash, body.code, res); // Возвращаем результат напрямую
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

  // @Post('logout')
  // @UseGuards(AuthGuard('jwt'))
  // @HttpCode(HttpStatus.OK)
  // async logout(@Req() req: CustomRequest, @Res() res: Response) {
  //   const user = req.user;
  //   await this.authService.logout(user['sub']);
  //   return res.json({ message: 'Вы вышли из системы' });
  // }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res() response: Response, @Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Вы уже вышли из системы.");
    }

    // Удаляем refreshToken из базы
    await this.authService.logout(refreshToken);

    // Очищаем куки
    response.clearCookie('accessToken', { httpOnly: true, secure: false, sameSite: 'lax' });
    response.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'lax' });

    return response.json({ message: "Вы успешно вышли." });
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: loginDto,
    @Res() response: Response
  ): Promise<void> {  // Изменил возврат на void, так как используем response
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    await this.authService.signIn(dto, response);

    const userTokens = await this.prismaService.userTokens.findUnique({
      where: { userId: user.id },
    });

    response.json({ requiresMasterPassword: !userTokens?.isMasterPasswordVerified });
  }


  @Post('verify-master-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async verifyMasterPassword(
    @Body() dto: { email: string; masterPassword: string }
  ): Promise<{ message: string }> {
    return this.authService.verifyMasterPassword(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return {
      isAuthenticated: true,
      user: req.user // Возвращаем данные пользователя
    };
  }
}