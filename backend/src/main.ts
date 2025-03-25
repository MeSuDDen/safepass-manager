import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.get(ConfigService);

  // CONNECT VALIDATION PIPE + DTO
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Преобразует данные в нужный тип
    whitelist: true, // Убирает невалидные поля
    forbidNonWhitelisted: true, // Выдает ошибку, если есть неожиданные поля
  }));

  // Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('Cats example')
  //   .setDescription('The cats API description')
  //   .setVersion('1.0')
  //   .addTag('cats')
  //   .build();
  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, documentFactory);

  // Глобальный префиск '/api'
  app.setGlobalPrefix('/api');

  // Используем переменную окружения PORT
  const port = process.env.PORT || 4000;

  // Запуск
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}
bootstrap();