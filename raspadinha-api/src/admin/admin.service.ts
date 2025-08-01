import { Injectable, NotFoundException } from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count()
    const totalTransactions = await this.prisma.transaction.count()
    const totalScratchCards = await this.prisma.scratchCards.count()
    const totalRevenueAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'PAYMENT', status: 'APPROVED' }, // Ajuste conforme seus tipos/status
    })

    return {
      totalUsers,
      totalTransactions,
      totalScratchCards,
      totalRevenue: totalRevenueAgg._sum.amount ?? 0,
    }
  }

  async getGrowth() {
    // Exemplo: calcula crescimento mês atual vs mês anterior
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // Janeiro=1
    const currentYear = now.getFullYear()

    // Datas mês atual
    const startCurrentMonth = new Date(currentYear, currentMonth - 1, 1)
    const startNextMonth = new Date(currentYear, currentMonth, 1)

    // Datas mês anterior
    const startPrevMonth = new Date(currentYear, currentMonth - 2, 1)

    // Função auxiliar para evitar divisão por zero
    const calcGrowth = (current: number, previous: number) =>
      previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100

    // Contagem usuários
    const usersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startCurrentMonth,
          lt: startNextMonth,
        },
      },
    })
    const usersLastMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startPrevMonth,
          lt: startCurrentMonth,
        },
      },
    })

    // Transações mês atual e anterior
    const transactionsThisMonth = await this.prisma.transaction.count({
      where: {
        createdAt: {
          gte: startCurrentMonth,
          lt: startNextMonth,
        },
      },
    })
    const transactionsLastMonth = await this.prisma.transaction.count({
      where: {
        createdAt: {
          gte: startPrevMonth,
          lt: startCurrentMonth,
        },
      },
    })

    // Raspadinhas mês atual e anterior
    const scratchCardsThisMonth = await this.prisma.scratchCards.count({
      where: {
        createdAt: {
          gte: startCurrentMonth,
          lt: startNextMonth,
        },
      },
    })
    const scratchCardsLastMonth = await this.prisma.scratchCards.count({
      where: {
        createdAt: {
          gte: startPrevMonth,
          lt: startCurrentMonth,
        },
      },
    })

    // Receita mês atual e anterior (somente pagamentos aprovados)
    const revenueThisMonthAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'PAYMENT',
        status: 'APPROVED',
        createdAt: {
          gte: startCurrentMonth,
          lt: startNextMonth,
        },
      },
    })
    const revenueLastMonthAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'PAYMENT',
        status: 'APPROVED',
        createdAt: {
          gte: startPrevMonth,
          lt: startCurrentMonth,
        },
      },
    })

    const revenueThisMonth = revenueThisMonthAgg._sum.amount ?? 0
    const revenueLastMonth = revenueLastMonthAgg._sum.amount ?? 0

    return {
      usersGrowth: calcGrowth(usersThisMonth, usersLastMonth),
      transactionsGrowth: calcGrowth(transactionsThisMonth, transactionsLastMonth),
      scratchCardsGrowth: calcGrowth(scratchCardsThisMonth, scratchCardsLastMonth),
      revenueGrowth: calcGrowth(revenueThisMonth, revenueLastMonth),
    }
  }

  async findOneWithPrizes(id: string) {
    return this.prisma.scratchCards.findUnique({
      where: { id },
      include: { prizes: true },
    })
  }async findTransactionAllPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    type?: string,
    status?: string,
  ) {
    const where: any = {
      accountId: userId,
    };
  
    const searchConditions = [];
  
    if (search) {
      searchConditions.push(
        { description: { contains: search } },
        { externalId: { contains: search } },
        {
          scratchCard: {
            is: {
              name: { contains: search },
            },
          },
        },
      );
    }
  
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }
  
    if (type) {
      where.type = type;
    }
  
    if (status) {
      where.status = status;
    }
  
    const total = await this.prisma.transaction.count({ where });
  
    const data = await this.prisma.transaction.findMany({
      where,
      include: {
        scratchCard: {
          select: { id: true, name: true },
        },
        user: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }  

  async findAllPaginated(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}

    const total = await this.prisma.user.count({ where })

    const data = await this.prisma.user.findMany({
      where,
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

  async getDashboardStats() {
    const [totalUsers, totalTransactions, totalScratchCards, totalRevenue] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.transaction.count(),
      this.prisma.scratchCards.count(),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'APPROVED' },
      }),
    ])

    return {
      totalUsers,
      totalTransactions,
      totalScratchCards,
      totalRevenue: totalRevenue._sum.amount ?? 0,
    }
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    })
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async getAllTransactions() {
    return this.prisma.transaction.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        scratchCard: { select: { id: true, name: true } },
      },
      where: {
        type: { in: ['PAYMENT', 'TRANSFER', 'WIN', 'BET'] },
        deletedAt: null
      },
    })
  }

  async getRecentUsers() {
    return this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })
  }

  async getRecentTransactions() {
    return this.prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        type: { in: ['PAYMENT', 'TRANSFER'] },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        createdAt: true,
      },
    })
  }

  async getPrizes(scratchCardId: string) {
    return this.prisma.scratchPrize.findMany({
      where: { scratchCardId },
      select: {
        id: true,
        scratchCardId: true,
        image: true,
        name: true,
        description: true,
        type: true,
        value: true,
        rtp: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
  
  async createPrize(scratchCardId: string, data: {
    name: string
    description: string
    image: string
    type: 'MONEY'
    value: number
    rtp: number
  }) {
    return this.prisma.scratchPrize.create({
      data: {
        scratchCardId,
        ...data,
      },
    })
  }
  
  async updatePrize(scratchCardId: string, prizeId: string, data: {
    name: string
    description: string
    image: string
    type: 'MONEY'
    value: number
    rtp: number
  }) {
    return this.prisma.scratchPrize.updateMany({
      where: {
        id: prizeId,
        scratchCardId,
      },
      data,
    })
  }
  
  async deletePrize(scratchCardId: string, prizeId: string) {
    await this.prisma.scratchPrize.deleteMany({
      where: {
        id: prizeId,
        scratchCardId,
      },
    })
    return { success: true }
  }  
}
