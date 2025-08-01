import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
