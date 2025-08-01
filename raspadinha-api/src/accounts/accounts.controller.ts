import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { GetUser } from 'src/decorators/get-user.decorator';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(dto);
  }

  @Get('me')
  @Auth()
  async getMe(@GetUser('id') userId: string) {
    const user = await this.accountsService.getMe(userId);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
