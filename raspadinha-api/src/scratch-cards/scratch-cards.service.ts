import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateScratchCardDto } from './dto/create-scratch-card.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ScratchCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    return this.prisma.scratchCards.findMany({
      select: {
        id: true,
        amount: true,
        name: true,
        description: true,
        image: true,
        status: true,
        rtp: true,
      },
    })
  }

  async findAllAdmin() {
    return this.prisma.scratchCards.findMany({
      include: {
        prizes: true,
      },
    })
  }

  async create(dto: CreateScratchCardDto) {
    return this.prisma.scratchCards.create({ data: dto })
  }

  async update(id: string, dto: CreateScratchCardDto) {
    const card = await this.prisma.scratchCards.findUnique({ where: { id } })
    if (!card) {
      throw new NotFoundException('Scratch card not found')
    }
    return this.prisma.scratchCards.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.prisma.scratchCards.delete({ where: { id } })
    return { success: true }
  }
}
