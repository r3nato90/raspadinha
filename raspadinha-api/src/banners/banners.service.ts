import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const count = await this.prisma.banners.count();
    return this.prisma.banners.create({
      data: {
        ...data,
        order: count + 1,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.banners.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.banners.delete({
      where: { id },
    });
  }
}
