"use client"

import { useState, useEffect } from "react"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/user-context"

interface DashboardStats {
  totalUsers: number
  totalTransactions: number
  totalScratchCards: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalScratchCards: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get("/admin/dashboard/stats")
      setStats(response.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar as estatísticas do dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboardStats()
    }
  }, [userLoading, user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} />

      {/* Recent Activity */}
      <AdminRecentActivity />
    </div>
  )
}
