import { Controller, Post, Get, Param, Body, UseGuards, Request } from "@nestjs/common"
import { ScratchGamesService } from "./scratch-games.service"
import { JwtAuthGuard } from "src/auth/jwt-auth-guard"
import { ClaimScratchPrizeDto } from "./dto/claim-scratch-prize.dto"

@Controller("scratch-cards")
export class ScratchGamesController {
  constructor(private readonly scratchGamesService: ScratchGamesService) {}

  // Listar raspadinhas disponíveis
  @Get()
  async getAvailableCards() {
    return this.scratchGamesService.getAvailableCards()
  }

  // Jogar raspadinha
  @UseGuards(JwtAuthGuard)
  @Post(":id/play")
  async play(@Param('id') scratchCardId: string, @Request() req) {
    const userId = req.user.id
    return this.scratchGamesService.play(scratchCardId, userId)
  }

  // Reivindicar prêmio
  @UseGuards(JwtAuthGuard)
  @Post("games/:gameId/claim")
  async claimPrize(@Param('gameId') gameId: string, @Body() claimData: ClaimScratchPrizeDto, @Request() req) {
    const userId = req.user.id
    return this.scratchGamesService.claimPrize(gameId, claimData, userId)
  }
}
