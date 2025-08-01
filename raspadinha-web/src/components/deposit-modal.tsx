"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2, QrCode, FileText, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/services/apiClient"

interface DepositModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface DepositDto {
  document: string
  amount: number
}

export function DepositModal({ isOpen, onOpenChange }: DepositModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [depositData, setDepositData] = useState<{
    qrCode: string
    qrCodeText: string
    transactionId: string
    amount: number
    expiresAt: string
    status: string
  } | null>(null)

  const { toast } = useToast()
  const { user } = useUser()

  const [formData, setFormData] = useState({
    document: user?.document || "",
    amount: "",
  })

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "")

    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    }

    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value)
    setFormData({ ...formData, document: formatted })
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const amount = Number.parseInt(numbers) / 100

    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setFormData({ ...formData, amount: formatted })
  }

  const getAmountValue = () => {
    return Number.parseFloat(formData.amount.replace(/[^\d,]/g, "").replace(",", ".")) || 0
  }

  const validateForm = (): string | null => {
    if (!formData.document.trim()) {
      return "Documento é obrigatório"
    }

    const amount = getAmountValue()
    if (amount < 1) {
      return "Valor mínimo é R$ 1,00"
    }

    if (amount > 25000) {
      return "Valor máximo é R$ 25.000,00"
    }

    return null
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado! ✅",
        description: "Código PIX copiado para a área de transferência.",
      })
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código PIX.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const requestData: DepositDto = {
        document: formData.document.replace(/\D/g, ""),
        amount: getAmountValue(),
      }

      console.log("Enviando dados:", requestData)

      const response = await apiClient.post("/financial/deposit", requestData)

      console.log("Resposta completa:", response)
      console.log("Dados da resposta:", response.data)

      // Verificar se a resposta tem a estrutura esperada
      if (response.data && response.data.success && response.data.data) {
        const responseData = response.data.data

        console.log("Dados extraídos:", responseData)

        // Verificar se todos os campos necessários estão presentes
        if (responseData.qrCode && responseData.transactionId) {
          setDepositData({
            qrCode: responseData.qrCode,
            qrCodeText: responseData.qrCodeText || "",
            transactionId: responseData.transactionId,
            amount: responseData.amount,
            expiresAt: responseData.expiresAt || "",
            status: responseData.status || "PENDING",
          })

          toast({
            title: "QR Code gerado! 📱",
            description: "Escaneie o código para realizar o pagamento.",
          })
        } else {
          console.error("Campos obrigatórios ausentes:", responseData)
          throw new Error("QR Code ou ID da transação não encontrados na resposta")
        }
      } else {
        console.error("Estrutura de resposta inválida:", response.data)
        throw new Error("Formato de resposta inválido")
      }
    } catch (error: any) {
      console.error("Erro completo:", error)
      console.error("Resposta do erro:", error.response?.data)

      let errorMessage = "Erro ao gerar QR Code. Tente novamente."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Erro ao processar depósito",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDepositData(null)
    setFormData({
      document: user?.document || "",
      amount: "",
    })
    onOpenChange(false)
  }

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            Depositar
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {depositData ? "Escaneie o QR Code para pagar" : "Informe os dados para gerar o QR Code"}
          </DialogDescription>
        </DialogHeader>

        {depositData ? (
          <div className="space-y-4 text-center">
            {/* QR Code Image */}
            <div className="bg-white p-4 rounded-lg border-2 border-border mx-auto w-fit">
              <img
                src={depositData.qrCode || "/placeholder.svg"}
                alt="QR Code para pagamento"
                className="w-48 h-48"
                onError={(e) => {
                  console.error("Erro ao carregar imagem do QR Code")
                  e.currentTarget.src = "/placeholder.svg?height=192&width=192&text=QR+Code"
                }}
              />
            </div>

            {/* PIX Code */}
            {depositData.qrCodeText && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Código PIX (Copia e Cola):</p>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <code className="text-xs break-all flex-1 text-left">{depositData.qrCodeText}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(depositData.qrCodeText)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Amount and Expiration */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Valor:{" "}
                {depositData.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                O pagamento será processado automaticamente após a confirmação.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="document"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.document}
                  onChange={handleDocumentChange}
                  className="pl-10"
                  maxLength={18}
                  required
                  disabled={isLoading || !!user?.document}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="text"
                  placeholder="R$ 0,00"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Mínimo: R$ 1,00 • Máximo: R$ 25.000,00</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
