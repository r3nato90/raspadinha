import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [BannersController],
  providers: [BannersService, PrismaService],
})
export class BannersModule {}
