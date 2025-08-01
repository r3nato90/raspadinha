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
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/services/apiClient"
import type { LoginDto } from "@/types/user"

interface LoginModalProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const { toast } = useToast()
  const { setUser } = useUser()

  // Use controlled or uncontrolled state
  const modalOpen = isOpen !== undefined ? isOpen : internalOpen
  const setModalOpen = onOpenChange || setInternalOpen

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const validateForm = (): string | null => {
    if (!formData.email.includes("@")) {
      return "Email inválido"
    }

    if (formData.password.length < 6) {
      return "Senha deve ter pelo menos 6 caracteres"
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
      const loginData: LoginDto = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }

      const response = await authService.login(loginData)

      // Salvar token no localStorage
      localStorage.setItem("token", response.token)

      // Configurar token no axios
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.token}`

      // Atualizar contexto do usuário
      setUser(response.account)

      toast({
        title: "Login realizado com sucesso! 🎉",
        description: `Bem-vindo de volta, ${response.account.name}!`,
      })

      // Limpar formulário
      setFormData({
        email: "",
        password: "",
      })

      // Fechar modal
      setModalOpen(false)

      console.log("Usuário logado:", response.account)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Email ou senha incorretos."

      toast({
        title: "Erro ao fazer login",
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
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
        >
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Entrar</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Entre na sua conta para continuar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
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
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
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

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground">
              Esqueceu sua senha?
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
