import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ScratchCardsController } from './scratch-cards.controller'
import { ScratchCardsService } from './scratch-cards.service'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ScratchCardsController],
  providers: [ScratchCardsService],
})
export class ScratchCardsModule {}
