import { Module } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
