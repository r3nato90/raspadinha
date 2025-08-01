import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.settings.findFirst();
    const banners = await this.prisma.banners.findMany({
      orderBy: { order: 'asc' },
    });

    return {
      ...settings,
      banners,
    };
  }

  async updateSettings(data: any) {
    const current = await this.prisma.settings.findFirst();
    return this.prisma.settings.update({
      where: { id: current.id },
      data,
    });
  }
}
