import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getCredentials(@Param('userId') userId: string) {
    return this.credentialsService.getAllByUser(userId);
  }
}
