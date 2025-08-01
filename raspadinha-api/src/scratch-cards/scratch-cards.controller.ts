import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { ScratchCardsService } from './scratch-cards.service'
import { Auth } from 'src/decorators/auth.decorator'
import { CreateScratchCardDto } from './dto/create-scratch-card.dto'

@Controller()
export class ScratchCardsController {
  constructor(private readonly scratchCardsService: ScratchCardsService) {}

  @Get('scratch-cards')
  findAllPublic() {
    return this.scratchCardsService.findAllPublic()
  }

  @Get('admin/scratch-cards')
  @Auth(true)
  findAllAdmin() {
    return this.scratchCardsService.findAllAdmin()
  }

  @Post('admin/scratch-cards')
  @Auth(true)
  create(@Body() dto: CreateScratchCardDto) {
    return this.scratchCardsService.create(dto)
  }

  @Put('admin/scratch-cards/:id')
  @Auth(true)
  update(@Param('id') id: string, @Body() dto: CreateScratchCardDto) {
    return this.scratchCardsService.update(id, dto)
  }

  @Delete('admin/scratch-cards/:id')
  @Auth(true)
  remove(@Param('id') id: string) {
    return this.scratchCardsService.remove(id)
  }
}
