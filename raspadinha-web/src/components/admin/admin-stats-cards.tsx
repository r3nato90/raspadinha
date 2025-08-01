"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Gamepad2, TrendingUp } from "lucide-react"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"

interface StatsCardsProps {
  stats: {
    totalUsers: number
    totalTransactions: number
    totalScratchCards: number
    totalRevenue: number
  }
}

interface StatsGrowth {
  usersGrowth: number
  transactionsGrowth: number
  scratchCardsGrowth: number
  revenueGrowth: number
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const [growth, setGrowth] = useState<StatsGrowth>({
    usersGrowth: 0,
    transactionsGrowth: 0,
    scratchCardsGrowth: 0,
    revenueGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchGrowthStats = async () => {
    try {
      const response = await apiClient.get("/admin/dashboard/growth")
      setGrowth(response.data)
    } catch (error) {
      // Se não conseguir carregar o crescimento, usa valores padrão
      console.warn("Não foi possível carregar estatísticas de crescimento")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrowthStats()
  }, [])

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          {!loading && (
            <p className={`text-xs ${getGrowthColor(growth.usersGrowth)}`}>
              {formatGrowth(growth.usersGrowth)} em relação ao mês passado
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
          {!loading && (
            <p className={`text-xs ${getGrowthColor(growth.transactionsGrowth)}`}>
              {formatGrowth(growth.transactionsGrowth)} em relação ao mês passado
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Raspadinhas</CardTitle>
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalScratchCards}</div>
          {!loading && (
            <p className={`text-xs ${getGrowthColor(growth.scratchCardsGrowth)}`}>
              {formatGrowth(growth.scratchCardsGrowth)} adicionadas este mês
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(stats.totalRevenue)}
          </div>
          {!loading && (
            <p className={`text-xs ${getGrowthColor(growth.revenueGrowth)}`}>
              {formatGrowth(growth.revenueGrowth)} em relação ao mês passado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
