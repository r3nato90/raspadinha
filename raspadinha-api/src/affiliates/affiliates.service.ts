import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async getAffiliateStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        affiliateCode: true,
      },
    })

    if (!user) throw new Error('User not found')

    const referrals = await this.prisma.user.findMany({
      where: { referredByCode: user.affiliateCode },
    })

    const totalReferrals = referrals.length

    // Suponha que earnings estão salvas como transactions do tipo "AFFILIATE_COMMISSION"
    const totalEarningsResult = await this.prisma.transaction.aggregate({
      where: {
        accountId: userId,
        type: 'INDICATION',
        status: { in: ['COMPLETED', 'APPROVED'] }
      },
      _sum: {
        amount: true,
      },
    })

    const totalEarnings = Number(totalEarningsResult._sum.amount ?? 0)

    return {
      affiliateCode: user.affiliateCode,
      totalReferrals,
      totalEarnings,
      referralLink: process.env.APP_URL + `/r/${user.affiliateCode}`,
    }
  }

  async getReferrals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { affiliateCode: true },
    })

    if (!user) throw new Error('User not found')

    const referrals = await this.prisma.user.findMany({
      where: {
        referredByCode: user.affiliateCode,
      },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return referrals.map(ref => ({
      name: ref.name,
      email: ref.email,
      joinedAt: ref.createdAt,
    }))
  }
}
