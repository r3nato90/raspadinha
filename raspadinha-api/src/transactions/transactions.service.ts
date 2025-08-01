import { Injectable } from '@nestjs/common'
import { TransactionType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId: userId },
      select: {
        id: true,
        externalId: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        scratchCardId: true,
        scratchCard: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        paidAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAllPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    type?: string,
    status?: string,
  ) {
    const where: any = {
      accountId: userId,
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { externalId: { contains: search } },
        {
          scratchCard: {
            name: { contains: search },
          },
        },
      ]
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const total = await this.prisma.transaction.count({ where })

    const data = await this.prisma.transaction.findMany({
      where,
      include: {
        scratchCard: {
          select: { id: true, name: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getSummary(userId: string) {
    const sumAmount = async (type: TransactionType) =>
      (
        await this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            accountId: userId,
            type,
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
        })
      )._sum.amount ?? 0
  
    const totalDeposits = await sumAmount(TransactionType.PAYMENT)
    const totalWithdrawals = await sumAmount(TransactionType.TRANSFER)
    const totalBets = await sumAmount(TransactionType.VERIFY)
    const totalWins = await sumAmount(TransactionType.WIN)
  
    return {
      totalDeposits,
      totalWithdrawals,
      totalBets,
      totalWins,
    }
  }  
}
