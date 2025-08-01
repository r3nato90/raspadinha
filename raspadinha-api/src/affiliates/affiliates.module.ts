import { Module } from '@nestjs/common'
import { AffiliatesController } from './affiliates.controller'
import { AffiliatesService } from './affiliates.service'
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
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
})
export class AffiliatesModule {}
