import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { generateRandomPositions } from "./scratch-logic.util"
import { CreateScratchCardDto } from "./dto/create-scratch-card.dto"
import { UpdateScratchCardDto } from "./dto/update-scratch-card.dto"
import { ClaimScratchPrizeDto } from "./dto/claim-scratch-prize.dto"

@Injectable()
export class ScratchGamesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableCards() {
    return this.prisma.scratchCards.findMany({
      where: {
        status: "ACTIVE", // Assumindo que você tem um campo status
      },
      include: {
        prizes: true,
      },
    })
  }

  async play(cardId: string, userId: string) {
    // Buscar a raspadinha
    const card = await this.prisma.scratchCards.findUnique({
      where: { id: cardId },
      include: {
        prizes: true,
      },
    })

    if (!card || card.status !== "ACTIVE") {
      throw new NotFoundException("Raspadinha não encontrada ou inativa.")
    }

    // Buscar o usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException("Usuário inválido.")
    }

    if (user.balance < card.amount) {
      throw new UnauthorizedException("Saldo insuficiente.")
    }

    // Criar transação PENDING
    const transaction = await this.prisma.transaction.create({
      data: {
        externalId: `SCRATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        accountId: userId,
        type: "VERIFY",
        amount: -card.amount,
        description: `Compra de raspadinha: ${card.name}`,
        status: "PENDING",
        scratchCardId: cardId,
      },
    })

    // Debitar saldo do usuário
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: card.amount,
        },
      },
    })

    // Gerar posições aleatórias
    const positions = generateRandomPositions(card.rtp, card.prizes)

    // Criar jogo
    const game = await this.prisma.scratchGame.create({
      data: {
        id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        scratchCardId: cardId,
        transactionId: transaction.id,
        positions: JSON.stringify(positions),
        status: "ACTIVE",
      },
    })

    return {
      gameId: game.id,
      transactionId: transaction.id,
      prizes: card.prizes,
      positions,
    }
  }

  async claimPrize(gameId: string, claimData: ClaimScratchPrizeDto, userId: string) {
    // Buscar o jogo
    const game = await this.prisma.scratchGame.findUnique({
      where: { id: gameId },
      include: {
        scratchCard: {
          include: {
            prizes: true,
          },
        },
        transaction: true,
      },
    })

    if (!game) {
      throw new NotFoundException("Jogo não encontrado.")
    }

    if (game.userId !== userId) {
      throw new UnauthorizedException("Jogo não pertence ao usuário.")
    }

    if (game.status !== "ACTIVE") {
      throw new BadRequestException("Jogo já foi finalizado.")
    }

    // Verificar transação
    if (game.transaction.id !== claimData.transactionId) {
      throw new BadRequestException("Transação não corresponde ao jogo.")
    }

    if (game.transaction.status !== "PENDING") {
      throw new BadRequestException("Transação já foi processada.")
    }

    // Validar posições
    const gamePositions = JSON.parse(game.positions as string)
    if (JSON.stringify(gamePositions) !== JSON.stringify(claimData.positions)) {
      throw new BadRequestException("Posições inválidas - possível tentativa de fraude.")
    }

    // Verificar se realmente ganhou
    let hasWon = false
    let prize = null

    if (claimData.prizeId) {
      const prizeCount: { [key: string]: number } = {}
      gamePositions.forEach((prizeId: string) => {
        prizeCount[prizeId] = (prizeCount[prizeId] || 0) + 1
      })

      hasWon = prizeCount[claimData.prizeId] >= 3

      if (!hasWon) {
        throw new BadRequestException("Prêmio inválido - usuário não ganhou.")
      }

      prize = game.scratchCard.prizes.find((p) => p.id === claimData.prizeId)
      if (!prize) {
        throw new NotFoundException("Prêmio não encontrado.")
      }
    }

    // Processar resultado
    if (hasWon && prize) {
      if (prize.type === "MONEY") {
        // Adicionar valor do prêmio ao saldo
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: prize.value,
            },
          },
        })

        // Criar transação do prêmio
        await this.prisma.transaction.create({
          data: {
            externalId: `PRIZE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountId: userId,
            type: "WIN",
            amount: prize.value,
            description: `Prêmio ganho: ${prize.name}`,
            status: "COMPLETED",
            scratchCardId: game.scratchCardId,
            paidAt: new Date(),
          },
        })
      }
    }

    // Finalizar transação original
    await this.prisma.transaction.update({
      where: { id: game.transactionId },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
    })

    // Finalizar jogo
    await this.prisma.scratchGame.update({
      where: { id: gameId },
      data: {
        status: "COMPLETED",
        prizeId: claimData.prizeId,
        completedAt: new Date(),
      },
    })

    // Buscar saldo atualizado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    return {
      success: true,
      hasWon,
      prize: hasWon ? prize : null,
      newBalance: updatedUser?.balance || 0,
    }
  }
}
