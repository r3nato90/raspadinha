"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, TrendingDown, CreditCard, Gamepad2, Calendar } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { CustomPagination } from "@/components/custom-pagination"

interface Transaction {
  id: string
  externalId: string
  type: "BET" | "WIN" | "PAYMENT" | "TRANSFER" | "VERIFY" | "INDICATION"
  amount: number
  description: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  scratchCardId?: string
  scratchCard?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  paidAt?: string
}

interface PaginatedResponse {
  data: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function TransactionsPage() {
  const { user, loading: userLoading } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBets: 0,
    totalWins: 0,
  })
  const { toast } = useToast()

  const itemsPerPage = 10

  const fetchTransactions = async (page = 1, search = "", type = "all", status = "all") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(type !== "all" && { type }),
        ...(status !== "all" && { status }),
      })

      const response = await apiClient.get<PaginatedResponse>(`/transactions?${params}`)
      if (response.data && response.data.data) {
        setTransactions(response.data.data)
        setCurrentPage(response.data.pagination.page)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.total)
      } else {
        // Fallback para API sem paginação
        setTransactions(response.data || [])
        setTotalItems(response.data?.length || 0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error)
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar suas transações",
        variant: "destructive",
      })
      // Definir valores padrão em caso de erro
      setTransactions([])
      setTotalItems(0)
      setTotalPages(1)
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get("/transactions/summary")
      setSummary(response.data)
    } catch (error) {
      console.warn("Não foi possível carregar o resumo das transações")
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions(1, searchTerm, typeFilter, statusFilter)
      fetchSummary()
    }
  }, [user, searchTerm, typeFilter, statusFilter])

  const handlePageChange = (page: number) => {
    fetchTransactions(page, searchTerm, typeFilter, statusFilter)
  }

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "BET":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "WIN":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-blue-500" />
      case "TRANSFER":
        return <CreditCard className="w-4 h-4 text-purple-500" />
      case "VERIFY":
        return <Gamepad2 className="w-4 h-4 text-orange-500" />
      case "INDICATION":
        return <Gamepad2 className="w-4 h-4 text-emerald-500" />
      default:
        return <Gamepad2 className="w-4 h-4 text-muted-foreground" />
    }
  }  

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "BET":
        return "Aposta"
      case "WIN":
        return "Ganho"
      case "VERIFY":
        return "Aposta"
      case "PAYMENT":
        return "Depósito"
      case "TRANSFER":
        return "Saque"
      case "INDICATION":
        return "Indicação"
      default:
        return type
    }
  }  

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "BET":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "WIN":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "PAYMENT":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "TRANSFER":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "VERIFY":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "INDICATION":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "FAILED":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "CANCELLED":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Concluída"
      case "PENDING":
        return "Pendente"
      case "FAILED":
        return "Falhou"
      case "CANCELLED":
        return "Cancelada"
      default:
        return status
    }
  }

  if (userLoading || !user) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Minhas Transações</h1>
          <p className="text-muted-foreground">Histórico completo de suas transações</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Depositado</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalDeposits)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sacado</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalWithdrawals)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Apostado</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalBets)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalWins)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="PAYMENT">Depósito</SelectItem>
                  <SelectItem value="TRANSFER">Saque</SelectItem>
                  <SelectItem value="BET">Aposta</SelectItem>
                  <SelectItem value="WIN">Ganho</SelectItem>
                  <SelectItem value="INDICATION">Indicação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Todas as suas transações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && transactions.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTransactionColor(transaction.type)}>
                            {getTransactionLabel(transaction.type)}
                          </Badge>
                          {transaction.type !== 'VERIFY' && (
                            <Badge className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.scratchCard && (
                          <p className="text-sm text-muted-foreground">Raspadinha: {transaction.scratchCard.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)} • ID: {transaction.externalId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          (transaction.type === "BET" || transaction.type === "VERIFY") || transaction.type === "TRANSFER"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(transaction.type === "BET" || transaction.type === "VERIFY") || transaction.type === "TRANSFER" ? (transaction.type === "VERIFY" ? '' : '-') : "+"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma transação encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </Container>
  )
}
