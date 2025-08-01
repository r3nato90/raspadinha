import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { BspayService } from 'src/gateway/bspay.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [FinancialController],
  providers: [FinancialService, PrismaService, BspayService],
})
export class FinancialModule {}
