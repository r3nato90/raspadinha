import { Controller, Post, Logger, HttpStatus, HttpCode, Get, Body } from "@nestjs/common"
import { Request, Response } from "express"
import { WebhooksService } from "./webhooks.service"

// Interfaces para o conteúdo do requestBody
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

// Interfaces para o payload completo que chega do BSPay
interface BSPayCashInWebhook {
  requestBody: BSPayCashInData
}

interface BSPayCashOutWebhook {
  requestBody: BSPayCashOutData
}

type BSPayWebhook = BSPayCashInWebhook | BSPayCashOutWebhook

@Controller("webhooks")
export class WebhooksController {
  logger: Logger
  webhooksService: WebhooksService

  constructor(webhooksService: WebhooksService) {
    this.logger = new Logger(WebhooksController.name)
    this.webhooksService = webhooksService
  }

  @Post("bspay")
  @HttpCode(HttpStatus.OK)
  async handleBSPayWebhookPost(@Body() payload: BSPayWebhook, req: Request) {
    this.logger.log("🔔 Webhook BSPay recebido via POST")
    this.logger.log(`📦 Payload completo: ${JSON.stringify(payload, null, 2)}`)

    try {
      // Verificar se o payload existe
      if (!payload) {
        this.logger.error("❌ Payload está vazio ou undefined")
        return { success: false, message: "Empty payload" }
      }

      const { requestBody } = payload

      if (!requestBody) {
        this.logger.error("❌ Payload inválido: requestBody não encontrado")
        this.logger.log(`📦 Payload recebido: ${JSON.stringify(payload, null, 2)}`)
        return { success: false, message: "Invalid payload structure" }
      }

      this.logger.log(`🔍 Tipo de transação: ${requestBody.transactionType}`)
      this.logger.log(`🆔 Transaction ID: ${requestBody.transactionId}`)
      this.logger.log(`🔗 External ID: ${requestBody.external_id}`)
      this.logger.log(`💰 Valor: R$ ${requestBody.amount}`)

      // Processar baseado no tipo de transação
      if (requestBody.transactionType === "RECEIVEPIX") {
        this.logger.log("💳 Processando Cash-in (Depósito)")
        const cashInData = requestBody as BSPayCashInData
        await this.webhooksService.processCashIn(cashInData)
      } else if (requestBody.transactionType === "PAYMENT") {
        this.logger.log("💸 Processando Cash-out (Saque)")
        const cashOutData = requestBody as BSPayCashOutData
        await this.webhooksService.processCashOut(cashOutData)
      } else {
        this.logger.warn(`⚠️ Tipo de transação não reconhecido: ${(requestBody as any).transactionType}`)
        return { success: false, message: "Unknown transaction type" }
      }

      this.logger.log("✅ Webhook processado com sucesso")
      return { success: true, message: "Webhook processed successfully" }
    } catch (error) {
      this.logger.error("💥 Erro ao processar webhook BSPay:", error)
      this.logger.error(`📍 Stack trace: ${error.stack}`)
      return { success: false, message: "Internal server error" }
    }
  }

  @Get("bspay")
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    this.logger.log("🔍 Health check do webhook BSPay")
    return {
      success: true,
      message: "BSPay webhook endpoint is healthy",
      timestamp: new Date().toISOString(),
    }
  }
}
