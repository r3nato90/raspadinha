import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { validate as isEmailValid } from 'email-validator';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async createAccount(dto: CreateAccountDto) {
    const { name, email, phone, password, confirmPassword, termsAccepted, referralCode } = dto;

    if (!termsAccepted) {
      throw new HttpException(
        'Você deve aceitar os termos.',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    if (!isEmailValid(email)) {
      throw new HttpException(
        'Email inválido',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    if (email.split('@')[0].length < 2) {
      throw new HttpException(
        'O email deve ter pelo menos 2 caracteres antes do @',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    if (password !== confirmPassword) {
      throw new HttpException(
        'As senhas não coincidem.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'Já existe uma conta com esse e-mail.',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    function generateAffiliateCode(length = 8): string {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        affiliateCode: generateAffiliateCode(),
        affiliateRate: 10,
        referredByCode: referralCode
      },
    });

    delete user.password;

    return user;
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }
    
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}
