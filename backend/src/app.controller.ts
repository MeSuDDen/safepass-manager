import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('flowers')
export class AppController {
  constructor(private readonly appService: AppService) {}
}
