import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { TransactionStatus } from "@prisma/client"

interface BSPayCashInData {
  transactionType: "RECEIVEPIX"
  transactionId: string
  external_id: string
  amount: number
  paymentType: "PIX"
  status: "PAID"
  dateApproval: string
  creditParty: {
    name: string
    email: string
    taxId: string
  }
  debitParty: {
    bank: string
    taxId: string
  }
}

interface BSPayCashOutData {
  transactionType: "PAYMENT"
  transactionId: string
  external_id: string
  amount: number
  dateApproval: string
  statusCode: {
    statusId: number
    description: string
  }
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private prisma: PrismaService) {}

  async processCashIn(data: BSPayCashInData): Promise<void> {
    this.logger.log("🔄 Iniciando processamento de Cash-in")

    try {
      // Buscar transação pelo external_id
      this.logger.log(`🔍 Buscando transação com external_id: ${data.transactionId}`)

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          externalId: data.transactionId,
          type: "PAYMENT",
        },
        include: {
          user: true,
        },
      })

      if (!transaction) {
        this.logger.error(`❌ Transação não encontrada: ${data.transactionId}`)
        return
      }

      this.logger.log(`✅ Transação encontrada: ${transaction.id}`)
      this.logger.log(`👤 Usuário: ${transaction.user.name} (${transaction.user.email})`)
      this.logger.log(`💰 Valor da transação: R$ ${transaction.amount}`)

      // Verificar se já foi processada
      if (transaction.status === TransactionStatus.COMPLETED) {
        this.logger.warn("⚠️ Transação já foi processada anteriormente")
        return
      }

      // Atualizar status da transação
      this.logger.log("🔄 Atualizando status da transação para COMPLETED")

      const currentMetadata = (transaction.metadata as Record<string, any>) || {}

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          metadata: {
            ...currentMetadata,
            bspayWebhook: {
              transactionId: data.transactionId,
              dateApproval: data.dateApproval,
              creditParty: data.creditParty,
              processedAt: new Date().toISOString(),
            },
          },
        },
      })

      // Adicionar saldo ao usuário
      this.logger.log(`💳 Adicionando R$ ${transaction.amount} ao saldo do usuário`)

      await this.prisma.user.update({
        where: { id: transaction.user.id },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      })

      this.logger.log("✅ Cash-in processado com sucesso!")
      this.logger.log(`📊 Novo saldo do usuário: R$ ${(transaction.user.balance + transaction.amount).toFixed(2)}`)
    } catch (error) {
      this.logger.error("💥 Erro ao processar Cash-in:", error)
      this.logger.error(`📍 Stack trace: ${error.stack}`)
      throw error
    }
  }

  async processCashOut(data: BSPayCashOutData) {
    this.logger.log("🔄 Iniciando processamento de Cash-out")

    try {
      // Buscar transação pelo external_id
      this.logger.log(`🔍 Buscando transação com external_id: ${data.transactionId}`)

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          externalId: data.transactionId,
          type: "TRANSFER",
        },
        include: {
          user: true,
        },
      })

      if (!transaction) {
        this.logger.error(`❌ Transação não encontrada: ${data.transactionId}`)
        return
      }

      this.logger.log(`✅ Transação encontrada: ${transaction.id}`)
      this.logger.log(`👤 Usuário: ${transaction.user.name} (${transaction.user.email})`)
      this.logger.log(`💰 Valor da transação: R$ ${transaction.amount}`)
      this.logger.log(`📊 Status Code: ${data.statusCode.statusId} - ${data.statusCode.description}`)

      // Determinar status baseado no statusCode
      const isApproved = data.statusCode.statusId === 1
      const newStatus = isApproved ? TransactionStatus.COMPLETED : TransactionStatus.REJECTED

      this.logger.log(`🎯 Novo status da transação: ${newStatus}`)

      // Atualizar transação
      const currentMetadata = (transaction.metadata as Record<string, any>) || {}

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          metadata: {
            ...currentMetadata,
            bspayWebhook: {
              transactionId: data.transactionId,
              dateApproval: data.dateApproval,
              statusCode: data.statusCode,
              processedAt: new Date().toISOString(),
            },
          },
        },
      })

      // Se falhou, reverter o saldo
      if (!isApproved) {
        this.logger.log(`🔄 Pagamento falhou - revertendo R$ ${Math.abs(transaction.amount)} ao saldo`)

        await this.prisma.user.update({
          where: { id: transaction.user.id },
          data: {
            balance: {
              increment: Math.abs(transaction.amount),
            },
          },
        })

        this.logger.log("💰 Saldo revertido com sucesso")
      }

      this.logger.log("✅ Cash-out processado com sucesso!")
    } catch (error) {
      this.logger.error("💥 Erro ao processar Cash-out:", error)
      this.logger.error(`📍 Stack trace: ${error.stack}`)
      throw error
    }
  }
}
