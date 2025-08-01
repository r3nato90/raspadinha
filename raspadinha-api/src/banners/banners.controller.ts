import { Controller, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BannersService } from './banners.service';
import { Auth } from 'src/decorators/auth.decorator';

@Controller('admin/banners')
@Auth(true)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  async create(@Body() body: any) {
    const data = await this.bannersService.create(body);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.bannersService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.bannersService.delete(id);
    return { success: true, data };
  }
}
