import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';
import { SecureController } from './secure.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [ AuthController, SecureController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, ConfigService, PrismaService, EmailService, JwtService ],
  exports: [ AuthService ]
})
export class AuthModule {}
