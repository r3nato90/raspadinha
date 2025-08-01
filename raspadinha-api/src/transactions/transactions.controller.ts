import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { GetUser } from 'src/decorators/get-user.decorator'
import { TransactionsService } from './transactions.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard'
import { Auth } from 'src/decorators/auth.decorator'

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Auth()
  @Get()
  async findAllPaginated(
    @GetUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 10

    return this.transactionsService.findAllPaginated(
      userId,
      pageNum,
      limitNum,
      search,
      type,
      status,
    )
  }

  @Auth()
  @Get('summary')
  async getSummary(@GetUser('id') userId: string) {
    return this.transactionsService.getSummary(userId)
  }
}
