import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordMatch = user && await bcrypt.compare(dto.password, user.password);

    if (!user || !passwordMatch) {
      throw new HttpException(
        'E-mail ou senha inválidos.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      expiresIn: '3h',
    });

    const { password, ...account } = user;

    return {
      account,
      token,
    };
  }
}
