"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Phone, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth"
import type { CreateAccountDto } from "@/types/user"
import { useSettings } from "@/contexts/settings-context"

interface RegisterModalProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function RegisterModal({ isOpen, onOpenChange, onSuccess }: RegisterModalProps) {
  const { settings } = useSettings();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const { toast } = useToast()

  // Use controlled or uncontrolled state
  const modalOpen = isOpen !== undefined ? isOpen : internalOpen
  const setModalOpen = onOpenChange || setInternalOpen

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara (00) 0 0000-0000
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim() || formData.name.length < 2) {
      return "Nome deve ter pelo menos 2 caracteres"
    }

    if (!formData.email.includes("@")) {
      return "Email inválido"
    }

    if (formData.phone.replace(/\D/g, "").length < 10) {
      return "Telefone inválido"
    }

    if (formData.password.length < 6) {
      return "Senha deve ter pelo menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      return "As senhas não coincidem"
    }

    if (!formData.termsAccepted) {
      return "Você deve aceitar os termos de serviço"
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
      const referralCode = sessionStorage.getItem("referralCode")

      const registerData: CreateAccountDto = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        termsAccepted: formData.termsAccepted,
        referralCode: referralCode || undefined,
      }

      const response = await authService.register(registerData)

      sessionStorage.removeItem("referralCode")

      toast({
        title: "Conta criada com sucesso! 🎉",
        description: `Bem-vindo ao ${settings?.siteName}, ${response.name}! Agora faça login para continuar.`,
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
      })

      onSuccess?.()
    } catch (error: any) {
      console.log(error)
      const errorMessage = error.response?.data?.message || "Erro ao criar conta. Tente novamente."

      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          Registrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Criar Conta</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Crie sua conta e comece a jogar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 0 0000-0000"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="pl-10"
                maxLength={16}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
              disabled={isLoading}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              Aceito os{" "}
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                termos de serviço
              </Button>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!formData.termsAccepted || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
