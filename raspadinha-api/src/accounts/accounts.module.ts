import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService],
})
export class AccountsModule {}
