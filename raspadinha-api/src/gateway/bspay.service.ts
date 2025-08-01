import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import axios from "axios"

interface GeneratePixRequest {
  amount: number
  external_id: string
  payer: {
    name: string
    document: string
    email?: string
  }
  payerQuestion?: string
  postbackUrl: string
}

interface PixPaymentRequest {
  amount: number
  description: string
  external_id: string
  creditParty: {
    name: string
    keyType: string
    key: string
    taxId: string
  }
}

interface PixResponse {
  transactionId: string
  external_id: string
  status: string
  amount: number
  calendar: {
    expiration: number
    dueDate: string
  }
  debtor: {
    name: string
    document: string
  }
  qrcode: string
}

interface PixPaymentResponse {
  transactionId: string
  external_id: string
  status: string
  amount: number
  description: string
  creditParty: {
    name: string
    keyType: string
    key: string
    taxId: string
  }
  createdAt: string
}

interface TokenResponse {
  access_token: string
  expires_in: number
}

interface BspayConfig {
  API_URL: string
  CLIENT_ID: string
  CLIENT_SECRET: string
  POSTBACK_URL: string
}

@Injectable()
export class BspayService {
  private readonly logger = new Logger(BspayService.name)
  private config: BspayConfig | null = null
  private configExpiresAt = 0
  private accessToken: string | null = null
  private tokenExpiresAt = 0

  constructor() {}

  /**
   * Carregar configurações das variáveis de ambiente
   */
  private async loadConfig(): Promise<BspayConfig> {
    try {

      this.config = {
        API_URL: process.env.BSPAY_API_URL || "https://api.bspay.co/v2",
        CLIENT_ID: process.env.BSPAY_CLIENT_ID,
        CLIENT_SECRET: process.env.BSPAY_CLIENT_SECRET,
        POSTBACK_URL: process.env.BSPAY_POSTBACK_URL || `${process.env.API_URL}/webhooks/bspay`,
      }
    } catch (error) {
      this.logger.error("Failed to load BSPay configuration:", error.message)
      throw new InternalServerErrorException("Failed to load payment gateway configuration")
    }

    if (!this.config.CLIENT_ID || !this.config.CLIENT_SECRET) {
      throw new Error("BSPay credentials not configured")
    }

    return this.config
  }

  /**
   * Obter token de acesso usando Basic Auth
   */
  private async getAccessToken(): Promise<string> {
    // Verificar se o token ainda é válido (com margem de 5 minutos)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken
    }

    try {
      // Carregar configurações mais recentes
      const config = await this.loadConfig()

      // Criar credenciais Basic Auth
      const credentials = `${config.CLIENT_ID}:${config.CLIENT_SECRET}`
      const base64Credentials = Buffer.from(credentials).toString("base64")

      this.logger.log("Requesting new access token from BSPay")

      const response = await axios.post<TokenResponse>(
        `${config.API_URL}/oauth/token`,
        {}, // Body vazio para token request
        {
          headers: {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      )

      this.accessToken = response.data.access_token
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000

      this.logger.log("Access token obtained successfully")
      return this.accessToken
    } catch (error) {
      this.logger.error("Failed to obtain access token:", error?.response?.data || error.message)

      // Limpar token e config em caso de erro de autenticação
      this.accessToken = null
      this.tokenExpiresAt = 0

      // Se erro 401, limpar também a config para forçar reload
      if (error?.response?.status === 401) {
        this.config = null
        this.configExpiresAt = 0
      }

      throw new InternalServerErrorException("Failed to authenticate with payment gateway")
    }
  }

  /**
   * Gerar QR Code PIX para depósitos
   */
  async generatePIX(data: {
    amount: number
    external_id: string
    payer: {
      id: string
      name?: string
      document?: string
      email?: string
    }
  }): Promise<{
    transaction_id: string
    external_id: string
    qr_code: string
    qr_code_base64: string
    pix_key: string
    expires_at: string
    amount: number
  }> {
    try {
      const accessToken = await this.getAccessToken()
      const config = await this.loadConfig()

      const payload: GeneratePixRequest = {
        amount: data.amount,
        external_id: data.external_id,
        payerQuestion: `Depósito Raspadinha - R$ ${data.amount.toFixed(2)}`,
        payer: {
          name: data.payer.name || "Cliente Raspadinha",
          document: data.payer.document || "00000000000",
          email: data.payer.email,
        },
        postbackUrl: config.POSTBACK_URL,
      }

      this.logger.log(`Generating PIX QR Code for amount: ${data.amount}`)

      const response = await axios.post<PixResponse>(`${config.API_URL}/pix/qrcode`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      const pixData = response.data

      // Gerar QR Code base64 se necessário
      let qrCodeBase64 = ""
      if (pixData.qrcode) {
        if (pixData.qrcode.startsWith("data:image")) {
          qrCodeBase64 = pixData.qrcode
        } else {
          qrCodeBase64 = await this.generateQRCodeImage(pixData.qrcode)
        }
      }

      this.logger.log(`PIX QR Code generated successfully: ${pixData.transactionId}`)

      return {
        transaction_id: pixData.transactionId,
        external_id: pixData.external_id,
        qr_code: pixData.qrcode,
        qr_code_base64: qrCodeBase64,
        pix_key: pixData.qrcode,
        expires_at: pixData.calendar.dueDate,
        amount: pixData.amount,
      }
    } catch (error) {
      this.logger.error("Failed to generate PIX QR Code:", error?.response?.data || error.message)

      if (error?.response?.status === 401) {
        // Limpar tokens e config para forçar reload completo
        this.accessToken = null
        this.tokenExpiresAt = 0
        this.config = null
        this.configExpiresAt = 0
        throw new InternalServerErrorException("Payment gateway authentication failed")
      }

      throw new InternalServerErrorException("Failed to generate PIX payment")
    }
  }

  /**
   * Fazer pagamento PIX para saques
   */
  async makePixPayment(data: {
    amount: number
    external_id: string
    description: string
    creditParty: {
      name: string
      keyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM"
      key: string
      taxId: string
    }
  }): Promise<{
    transaction_id: string
    external_id: string
    status: string
    amount: number
    estimated_time: string
  }> {
    try {
      const accessToken = await this.getAccessToken()
      const config = await this.loadConfig()

      const payload: PixPaymentRequest = {
        amount: data.amount,
        description: data.description,
        external_id: data.external_id,
        creditParty: {
          name: data.creditParty.name,
          keyType: data.creditParty.keyType,
          key: data.creditParty.key,
          taxId: data.creditParty.taxId,
        },
      }

      this.logger.log(`Making PIX payment for amount: ${data.amount} to ${data.creditParty.key}`)

      const response = await axios.post<PixPaymentResponse>(`${config.API_URL}/pix/payment`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      const paymentData = response.data
      this.logger.log(`PIX payment initiated successfully: ${paymentData.transactionId}`)

      return {
        transaction_id: paymentData.transactionId,
        external_id: paymentData.external_id,
        status: paymentData.status,
        amount: paymentData.amount,
        estimated_time: "Até 30 minutos",
      }
    } catch (error) {
      this.logger.error("Failed to make PIX payment:", error?.response?.data || error.message)

      if (error?.response?.status === 401) {
        this.accessToken = null
        this.tokenExpiresAt = 0
        this.config = null
        this.configExpiresAt = 0
        throw new InternalServerErrorException("Payment gateway authentication failed")
      }

      if (error?.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Dados inválidos para o pagamento PIX"
        throw new InternalServerErrorException(errorMessage)
      }

      if (error?.response?.status === 422) {
        throw new InternalServerErrorException("Chave PIX inválida ou conta não encontrada")
      }

      throw new InternalServerErrorException("Failed to process PIX payment")
    }
  }

  /**
   * Gerar imagem QR Code em base64
   */
  private async generateQRCodeImage(text: string): Promise<string> {
    try {
      const QRCode = require("qrcode")
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      return qrCodeDataURL
    } catch (error) {
      this.logger.warn("Failed to generate QR Code image, returning text")
      return `data:text/plain;base64,${Buffer.from(text).toString("base64")}`
    }
  }

  /**
   * Verificar status de uma transação
   */
  async checkTransactionStatus(transactionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      const config = await this.loadConfig()

      const response = await axios.get(`${config.API_URL}/pix/transaction/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      })

      return response.data
    } catch (error) {
      this.logger.error("Failed to check transaction status:", error?.response?.data || error.message)
      throw new InternalServerErrorException("Failed to check payment status")
    }
  }

  /**
   * Método para forçar reload das configurações (útil para testes)
   */
  async reloadConfig(): Promise<void> {
    this.config = null
    this.configExpiresAt = 0
    this.accessToken = null
    this.tokenExpiresAt = 0
    await this.loadConfig()
    this.logger.log("Configuration reloaded successfully")
  }
}