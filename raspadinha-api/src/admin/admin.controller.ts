import { Controller, Get, Put, Param, Body, Post, Delete, Query } from '@nestjs/common'
import { AdminService } from './admin.service'
import { Auth } from 'src/decorators/auth.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { GetUser } from 'src/decorators/get-user.decorator'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @Auth(true)
  getDashboardStats() {
    return this.adminService.getDashboardStats()
  }

  @Get('dashboard/stats')
  @Auth(true)
  getStats() {
    return this.adminService.getStats()
  }

  @Get('dashboard/growth')
  @Auth(true)
  getGrowth() {
    return this.adminService.getGrowth()
  }

  @Get('users')
  @Auth(true)
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 10

    return this.adminService.findAllPaginated(pageNum, limitNum, search)
  }

  @Get('scratch-cards/:id')
  @Auth(true)
  getScratchCardById(@Param('id') id: string) {
    return this.adminService.findOneWithPrizes(id)
  }

  @Put('users/:id')
  @Auth(true)
  updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.adminService.updateUser(id, data)
  }

  @Auth()
  @Get('transactions')
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

    return this.adminService.findTransactionAllPaginated(
      userId,
      pageNum,
      limitNum,
      search,
      type,
      status,
    )
  }

  @Get('users/recent')
  @Auth(true)
  async getRecentUsers() {
    return this.adminService.getRecentUsers()
  }

  @Get('transactions/recent')
  @Auth(true)
  async getRecentTransactions() {
    return this.adminService.getRecentTransactions()
  }

  @Get('scratch-cards/:id/prizes')
  @Auth(true)
  getPrizes(@Param('id') scratchCardId: string) {
    return this.adminService.getPrizes(scratchCardId)
  }

  @Post('scratch-cards/:id/prizes')
  @Auth(true)
  createPrize(
    @Param('id') scratchCardId: string,
    @Body() data: {
      name: string
      description: string
      image: string
      type: 'MONEY'
      value: number
      rtp: number
    },
  ) {
    return this.adminService.createPrize(scratchCardId, data)
  }

  @Put('scratch-cards/:id/prizes/:prizeId')
  @Auth(true)
  updatePrize(
    @Param('id') scratchCardId: string,
    @Param('prizeId') prizeId: string,
    @Body() data: {
      name: string
      description: string
      image: string
      type: 'MONEY'
      value: number
      rtp: number
    },
  ) {
    return this.adminService.updatePrize(scratchCardId, prizeId, data)
  }

  @Delete('scratch-cards/:id/prizes/:prizeId')
  @Auth(true)
  deletePrize(
    @Param('id') scratchCardId: string,
    @Param('prizeId') prizeId: string,
  ) {
    return this.adminService.deletePrize(scratchCardId, prizeId)
  }
}
