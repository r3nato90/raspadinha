"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Copy, Share2, Wallet, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { WithdrawModal } from "@/components/withdraw-modal"
import type { AffiliateStats, AffiliateReferral } from "@/types/user"

export default function AffiliatesPage() {
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const { toast } = useToast()

  const fetchAffiliateData = async () => {
    try {
      const [statsResponse, referralsResponse] = await Promise.all([
        apiClient.get("/affiliates/stats"),
        apiClient.get("/affiliates/referrals"),
      ])

      setStats(statsResponse.data.data)
      setReferrals(referralsResponse.data.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de afiliado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.affiliateCode) {
      fetchAffiliateData()
    } else if (user && !user.affiliateCode) {
      setLoading(false)
    }
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const copyReferralLink = async () => {
    if (!stats?.referralLink) return

    try {
      await navigator.clipboard.writeText(stats.referralLink)
      toast({
        title: "Link copiado! ✅",
        description: "Link de indicação copiado para a área de transferência.",
      })
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      })
    }
  }

  const shareReferralLink = async () => {
    if (!stats?.referralLink) return

    const shareText = `🎉 Venha jogar raspadinhas online! Use meu link: ${stats.referralLink}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Raspadinha - Indicação",
          text: shareText,
          url: stats.referralLink,
        })
      } catch (err) {
        // Usuário cancelou
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Texto copiado! ✅",
          description: "Texto de compartilhamento copiado.",
        })
      } catch (err) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive",
        })
      }
    }
  }

  if (userLoading || loading) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa estar logado.</p>
        </div>
      </Container>
    )
  }

  if (!user.affiliateCode) {
    return (
      <Container className="py-12">
        <div className="text-center space-y-4">
          <Users className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Programa de Afiliados</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Você ainda não é um afiliado. Entre em contato com o suporte.
          </p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Afiliados</h1>
          <p className="text-muted-foreground">Ganhe indicando amigos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              <p className="text-xs text-muted-foreground">Pessoas indicadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalEarnings || 0)}</div>
              <p className="text-xs text-muted-foreground">Comissões recebidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Link de Indicação</CardTitle>
            <CardDescription>Compartilhe para ganhar comissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={stats?.referralLink || ""} readOnly className="font-mono text-sm" />
              <Button onClick={copyReferralLink} size="icon" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink} size="icon" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Seu Código</p>
                <p className="text-sm text-muted-foreground">Código de afiliado</p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {stats?.affiliateCode}
              </Badge>
            </div>

            <Button onClick={() => setWithdrawModalOpen(true)} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Sacar Ganhos
            </Button>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Indicações ({referrals.length})</CardTitle>
            <CardDescription>Pessoas que você indicou</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDate(referral.joinedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma indicação ainda</p>
                <p className="text-sm text-muted-foreground">Compartilhe seu link!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal isOpen={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} />
    </Container>
  )
}
