"use client"

import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Wallet, CreditCard, User, Mail, Phone, Calendar } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"

export default function AccountPage() {
  const { user, loading } = useUser()
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(balance)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Container className="py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className="py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Minha Conta</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e dados de contato</p>
          </div>

          {/* Saldo e Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Saldo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">{formatBalance(user.balance)}</div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setDepositModalOpen(true)} className="flex-1 max-w-40">
                    <Wallet className="w-4 h-4 mr-2" />
                    Depositar
                  </Button>
                  <Button variant="outline" onClick={() => setWithdrawModalOpen(true)} className="flex-1 max-w-40">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Sacar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Gerencie suas informações pessoais e dados de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" value={user.name} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user.email} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={user.phone || "Não informado"} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="document" value={user.document || "Não informado"} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="created">Membro desde</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="created" value={formatDate(user.createdAt)} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Conta</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="role"
                      value={user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>

      {/* Modals */}
      <DepositModal isOpen={depositModalOpen} onOpenChange={setDepositModalOpen} />
      <WithdrawModal isOpen={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} />
    </>
  )
}
