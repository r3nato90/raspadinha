import { Module } from "@nestjs/common"
import { ScratchGamesService } from "./scratch-games.service"
import { ScratchGamesController } from "./scratch-games.controller"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { PrismaService } from "src/prisma/prisma.service"

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [ScratchGamesController],
  providers: [ScratchGamesService, PrismaService],
})
export class ScratchGamesModule {}
