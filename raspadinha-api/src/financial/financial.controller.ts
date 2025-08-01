import { Controller, Post, Body, Get, BadRequestException } from "@nestjs/common"
import { FinancialService } from "./financial.service"
import { GetUser } from "src/decorators/get-user.decorator"
import { Auth } from "src/decorators/auth.decorator"

interface DepositDto {
  amount: number
  document: string
}

interface WithdrawDto {
  amount: number
  keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM"
  key: string
}

@Controller("financial")
@Auth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post("deposit")
  async deposit(@GetUser('id') userId: string, @Body() body: DepositDto) {
    const { amount, document } = body

    if (!amount || amount <= 0) {
      throw new BadRequestException("Invalid amount")
    }

    if (amount < 1 || amount > 25000) {
      throw new BadRequestException("Amount must be between R$ 1.00 and R$ 25,000.00")
    }

    return this.financialService.deposit(userId, amount, document)
  }

  @Post("withdraw")
  async withdraw(@GetUser('id') userId: string, @Body() body: WithdrawDto) {
    const { amount, keyType, key } = body

    if (!amount || amount <= 0) {
      throw new BadRequestException("Invalid amount")
    }

    if (!keyType || !key) {
      throw new BadRequestException("PIX key type and key are required")
    }

    // Validações básicas da chave PIX
    if (keyType === "EMAIL" && !key.includes("@")) {
      throw new BadRequestException("Invalid email format")
    }

    if (keyType === "PHONE" && key.replace(/\D/g, "").length < 10) {
      throw new BadRequestException("Invalid phone number")
    }

    if (keyType === "CPF" && key.replace(/\D/g, "").length !== 11) {
      throw new BadRequestException("Invalid CPF format")
    }

    if (keyType === "CNPJ" && key.replace(/\D/g, "").length !== 14) {
      throw new BadRequestException("Invalid CNPJ format")
    }

    return this.financialService.withdraw(userId, { amount, keyType, key })
  }

  @Get("recent")
  async getRecentTransactions(userId: string) {
    return this.financialService.getRecentTransactions(userId)
  }
}
