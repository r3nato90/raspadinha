import { Module } from "@nestjs/common"
import { WebhooksController } from "./webhooks.controller"
import { WebhooksService } from "./webhooks.service"
import { PrismaModule } from "../prisma/prisma.module"
import { JwtModule } from "@nestjs/jwt"

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
