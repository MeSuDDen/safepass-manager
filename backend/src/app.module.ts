import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { CredentialsModule } from './credentials/credentials.module';
import { FoldersModule } from './folders/folders.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [ AuthModule, EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CredentialsModule,
    FoldersModule,
    TagsModule,
  ],
  controllers: [],
  providers: [ PrismaService ]
})
export class AppModule {}
