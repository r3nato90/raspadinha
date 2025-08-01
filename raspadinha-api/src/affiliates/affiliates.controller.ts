import { Controller, Get } from '@nestjs/common'
import { AffiliatesService } from './affiliates.service'
import { GetUser } from 'src/decorators/get-user.decorator'
import { Auth } from 'src/decorators/auth.decorator'

@Controller('affiliates')
@Auth()
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get('stats')
  async getAffiliateStats(@GetUser('id') userId: string) {
    const data = await this.affiliatesService.getAffiliateStats(userId)
    return { success: true, data }
  }

  @Get('referrals')
  async getReferrals(@GetUser('id') userId: string) {
    const data = await this.affiliatesService.getReferrals(userId)
    return { success: true, data }
  }
}
