// settings.controller.ts
import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Auth } from 'src/decorators/auth.decorator';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/settings')
  async getSettings() {
    return {
      success: true,
      data: await this.settingsService.getSettings(),
    };
  }

  @Put('/admin/settings')
  @Auth(true)
  async updateSettings(@Body() body) {
    return {
      success: true,
      data: await this.settingsService.updateSettings(body),
    };
  }
}
