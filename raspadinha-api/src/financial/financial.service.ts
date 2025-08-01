import { ForbiddenException, Injectable, Logger } from "@nestjs/common"
import { PaymentMethods, TransactionStatus, TransactionType } from "@prisma/client"
import { BspayService } from "src/gateway/bspay.service"
import { PrismaService } from "src/prisma/prisma.service"

interface WithdrawDto {
  amount: number
  keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM"
  key: string
}

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name)

  constructor(
    private prisma: PrismaService,
    private bspay: BspayService,
  ) {}

  async deposit(userId: string, amount: number, document: string) {
    if (amount <= 0) {
      throw new ForbiddenException("Invalid deposit amount")
    }

    if (amount < 1 || amount > 25000) {
      throw new ForbiddenException("Amount must be between R$ 1.00 and R$ 25,000.00")
    }

    try {
      // Buscar dados do usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, document: true },
      })

      if (!user) {
        throw new ForbiddenException("User not found")
      }

      if (document && document !== user.document) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { document },
        })
      }

      // Criar transação no banco com status PENDING
      const transaction = await this.prisma.transaction.create({
        data: {
          accountId: userId,
          amount,
          type: TransactionType.PAYMENT,
          status: TransactionStatus.PENDING,
          paymentMethod: PaymentMethods.PIX,
          description: `PIX Deposit - R$ ${amount.toFixed(2)}`,
          externalId: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      })

      this.logger.log(`Creating deposit for user ${userId}, amount: ${amount}`)

      // Gerar QR Code com BSPay v2
      const pixResponse = await this.bspay.generatePIX({
        amount,
        external_id: transaction.id,
        payer: {
          id: userId,
          name: user.name,
          document: user.document,
          email: user.email,
        },
      })

      // Atualizar transação com dados do PIX
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          pix: pixResponse.pix_key,
          externalId: pixResponse.transaction_id,
          reference: pixResponse.transaction_id,
          metadata: {
            bspay_transaction_id: pixResponse.transaction_id,
            expires_at: pixResponse.expires_at,
            qr_code_base64: pixResponse.qr_code_base64,
          },
        },
      })

      this.logger.log(`PIX QR Code generated for transaction ${transaction.id}`)

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          qrCode: pixResponse.qr_code_base64,
          qrCodeText: pixResponse.pix_key,
          amount: amount,
          expiresAt: pixResponse.expires_at,
          status: "PENDING",
        },
      }
    } catch (error) {
      this.logger.error("Deposit creation failed:", error)

      if (error instanceof ForbiddenException) {
        throw error
      }

      throw new ForbiddenException("Failed to create deposit")
    }
  }

  async withdraw(userId: string, withdrawData: WithdrawDto) {
    const { amount, keyType, key } = withdrawData

    if (amount <= 0) {
      throw new ForbiddenException("Invalid withdraw amount")
    }

    if (amount < 1) {
      throw new ForbiddenException("Minimum withdrawal amount is R$ 1.00")
    }

    try {
      // Buscar dados do usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, document: true, balance: true },
      })

      if (!user) {
        throw new ForbiddenException("User not found")
      }

      if (user.balance < amount) {
        throw new ForbiddenException("Insufficient balance")
      }

      // Debitar saldo imediatamente
      await this.prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      })

      // Criar transação de saque
      const transaction = await this.prisma.transaction.create({
        data: {
          accountId: userId,
          amount: -amount, // Valor negativo para saque
          type: TransactionType.TRANSFER,
          status: TransactionStatus.PENDING,
          paymentMethod: PaymentMethods.PIX,
          description: `PIX Withdrawal - R$ ${amount.toFixed(2)}`,
          externalId: `with_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pix: key, // Salvar a chave PIX
        },
      })

      this.logger.log(`Withdrawal created for user ${userId}, amount: ${amount}`)

      // Fazer pagamento PIX via BSPay
      const pixPaymentResponse = await this.bspay.makePixPayment({
        amount,
        external_id: transaction.id,
        description: `Saque Raspadinha - R$ ${amount.toFixed(2)}`,
        creditParty: {
          name: user.name,
          keyType,
          key,
          taxId: user.document || "00000000000",
        },
      })

      // Atualizar transação com dados do pagamento PIX
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalId: pixPaymentResponse.transaction_id,
          reference: pixPaymentResponse.transaction_id,
          status: TransactionStatus.PENDING,
          metadata: {
            bspay_transaction_id: pixPaymentResponse.transaction_id,
            pix_key_type: keyType,
            pix_key: key,
            estimated_time: pixPaymentResponse.estimated_time,
          },
        },
      })

      this.logger.log(`PIX payment initiated for transaction ${transaction.id}`)

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          amount: amount,
          status: pixPaymentResponse.status,
          estimatedTime: pixPaymentResponse.estimated_time,
          pixKey: key,
          keyType: keyType,
        },
      }
    } catch (error) {
      this.logger.error("Withdrawal failed:", error)

      // Se houve erro após debitar o saldo, tentar reverter
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } },
        })
        this.logger.log(`Balance reverted for user ${userId} due to withdrawal error`)
      } catch (revertError) {
        this.logger.error("Failed to revert balance:", revertError)
        // Em caso de erro crítico, notificar administradores
      }

      if (error instanceof ForbiddenException) {
        throw error
      }

      throw new ForbiddenException("Failed to process withdrawal")
    }
  }

  async getRecentTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: userId,
        type: {
          in: [TransactionType.PAYMENT, TransactionType.TRANSFER],
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        externalId: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        paidAt: true,
      },
    })

    return {
      success: true,
      data: transactions,
    }
  }
}
