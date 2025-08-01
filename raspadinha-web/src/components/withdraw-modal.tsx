"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Loader2, Key, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/services/apiClient"
import type { WithdrawDto } from "@/types/user"

interface WithdrawModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawModal({ isOpen, onOpenChange }: WithdrawModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, refreshUser } = useUser()

  const [formData, setFormData] = useState({
    keyType: "" as "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM" | "",
    key: "",
    amount: "",
  })

  const keyTypeLabels = {
    CPF: "CPF",
    CNPJ: "CNPJ",
    EMAIL: "E-mail",
    PHONE: "Número de Telefone",
    RANDOM: "Chave Aleatória",
  }

  const formatKey = (value: string, type: string) => {
    switch (type) {
      case "CPF":
        const cpfNumbers = value.replace(/\D/g, "")
        return cpfNumbers
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})/, "$1-$2")

      case "CNPJ":
        const cnpjNumbers = value.replace(/\D/g, "")
        return cnpjNumbers
          .replace(/(\d{2})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1/$2")
          .replace(/(\d{4})(\d{1,2})/, "$1-$2")

      case "PHONE":
        const phoneNumbers = value.replace(/\D/g, "")
        if (phoneNumbers.length <= 2) {
          return `(${phoneNumbers}`
        } else if (phoneNumbers.length <= 3) {
          return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2)}`
        } else if (phoneNumbers.length <= 7) {
          return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2, 3)} ${phoneNumbers.slice(3)}`
        } else {
          return `(${phoneNumbers.slice(0, 2)}) ${phoneNumbers.slice(2, 3)} ${phoneNumbers.slice(3, 7)}-${phoneNumbers.slice(7, 11)}`
        }

      default:
        return value
    }
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value, formData.keyType)
    setFormData({ ...formData, key: formatted })
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

  const getKeyPlaceholder = () => {
    switch (formData.keyType) {
      case "CPF":
        return "000.000.000-00"
      case "CNPJ":
        return "00.000.000/0000-00"
      case "EMAIL":
        return "seu@email.com"
      case "PHONE":
        return "(00) 0 0000-0000"
      case "RANDOM":
        return "Chave PIX aleatória"
      default:
        return "Selecione o tipo de chave primeiro"
    }
  }

  const validateForm = (): string | null => {
    if (!formData.keyType) {
      return "Selecione o tipo de chave PIX"
    }

    if (!formData.key.trim()) {
      return "Chave PIX é obrigatória"
    }

    const amount = getAmountValue()
    if (amount <= 0) {
      return "Valor deve ser maior que zero"
    }

    if (user && amount > user.balance) {
      return "Saldo insuficiente"
    }

    // Validações específicas por tipo de chave
    switch (formData.keyType) {
      case "CPF":
        if (formData.key.replace(/\D/g, "").length !== 11) {
          return "CPF deve ter 11 dígitos"
        }
        break
      case "CNPJ":
        if (formData.key.replace(/\D/g, "").length !== 14) {
          return "CNPJ deve ter 14 dígitos"
        }
        break
      case "EMAIL":
        if (!formData.key.includes("@")) {
          return "E-mail inválido"
        }
        break
      case "PHONE":
        if (formData.key.replace(/\D/g, "").length < 10) {
          return "Telefone inválido"
        }
        break
    }

    return null
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
      const withdrawData: WithdrawDto = {
        keyType: formData.keyType as "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM",
        key:
          formData.keyType === "CPF" || formData.keyType === "CNPJ" || formData.keyType === "PHONE"
            ? formData.key.replace(/\D/g, "")
            : formData.key,
        amount: getAmountValue(),
      }

      await apiClient.post("/financial/withdraw", withdrawData)

      toast({
        title: "Saque solicitado com sucesso! 🎉",
        description: `Sua solicitação de saque de ${formData.amount} foi processada.`,
      })

      // Atualizar saldo do usuário
      await refreshUser()

      // Limpar formulário e fechar modal
      setFormData({
        keyType: "",
        key: "",
        amount: "",
      })
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro ao processar saque. Tente novamente."

      toast({
        title: "Erro ao processar saque",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      keyType: "",
      key: "",
      amount: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6" />
            Sacar
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Informe sua chave PIX e o valor para saque
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="keyType">Tipo de Chave PIX</Label>
            <Select
              value={formData.keyType}
              onValueChange={(value) => setFormData({ ...formData, keyType: value as any, key: "" })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de chave" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(keyTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Chave PIX</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="key"
                type="text"
                placeholder={getKeyPlaceholder()}
                value={formData.key}
                onChange={handleKeyChange}
                className="pl-10"
                required
                disabled={isLoading || !formData.keyType}
                maxLength={formData.keyType === "CNPJ" ? 18 : formData.keyType === "PHONE" ? 16 : undefined}
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
            {user && (
              <p className="text-xs text-muted-foreground">
                Saldo disponível:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(user.balance)}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando saque...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Solicitar Saque
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
