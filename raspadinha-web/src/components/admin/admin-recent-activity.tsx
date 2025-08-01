"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard } from "lucide-react"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"

interface RecentUser {
  id: string
  name: string
  email: string
  createdAt: string
}

interface RecentTransaction {
  id: string
  type: string
  amount: number
  createdAt: string
}

export function AdminRecentActivity() {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchRecentActivity = async () => {
    try {
      const [usersResponse, transactionsResponse] = await Promise.all([
        apiClient.get("/admin/users/recent"),
        apiClient.get("/admin/transactions/recent"),
      ])
      setRecentUsers(usersResponse.data)
      setRecentTransactions(transactionsResponse.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar atividades recentes",
        description: "Não foi possível carregar as atividades recentes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seg atrás`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min atrás`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} h atrás`
    } else {
      return `${Math.floor(diffInSeconds / 86400)} dias atrás`
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
            <CardDescription>Últimos usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas transações processadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usuários Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Recentes</CardTitle>
          <CardDescription>Últimos usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(user.createdAt)}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhum usuário recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas transações processadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{transaction.type}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(transaction.createdAt)}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhuma transação recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
