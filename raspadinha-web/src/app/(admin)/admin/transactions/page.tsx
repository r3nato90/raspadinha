"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye } from "lucide-react"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomPagination } from "@/components/custom-pagination"

interface Transaction {
  id: string
  externalId: string
  accountId: string
  type: "DEPOSIT" | "WITHDRAWAL" | "GAME" | "PRIZE"
  amount: number
  paymentMethod?: "PIX" | "CREDIT_CARD" | "DEBIT_CARD"
  description: string
  pix?: string
  reference?: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  scratchCardId?: string
  user: {
    id: string
    name: string
    email: string
  }
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const { toast } = useToast()

  const itemsPerPage = 10

  const fetchTransactions = async (page = 1, search = "", status = "all", type = "all") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(status !== "all" && { status }),
        ...(type !== "all" && { type }),
      })

      const response = await apiClient.get<PaginatedResponse>(`/admin/transactions?${params}`)

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
        description: "Não foi possível carregar a lista de transações",
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTransactions(1, searchTerm, statusFilter, typeFilter)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, typeFilter])

  const handlePageChange = (page: number) => {
    fetchTransactions(page, searchTerm, statusFilter, typeFilter)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20"
      case "TRANSFER":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
      case "WIN":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "BET":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "VERIFY":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transações</h1>
        <p className="text-muted-foreground">Visualize todas as transações da plataforma</p>
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
                placeholder="Buscar por usuário ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="COMPLETED">Concluída</SelectItem>
                <SelectItem value="FAILED">Falhou</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="PAYMENT">Depósito</SelectItem>
                <SelectItem value="TRANSFER">Saque</SelectItem>
                <SelectItem value="VERIFY">Aposta</SelectItem>
                <SelectItem value="WIN">Prêmio</SelectItem>
                <SelectItem value="INDICATION">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações ({totalItems})</CardTitle>
          <CardDescription>Todas as transações processadas na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Usuário</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="p-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="p-2">
                        <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="p-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="p-2">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-sm">{transaction.externalId.slice(0, 8)}...</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getTypeColor(transaction.type)}>
                          {["WIN", "BET", "PAYMENT", "TRANSFER", "VERIFY"].includes(transaction.type)
                            ? "Aposta"
                            : transaction.type}
                        </Badge>
                      </td>
                      <td className="p-2 font-medium">{formatCurrency(transaction.amount)}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                      </td>
                      <td className="p-2 text-muted-foreground">{formatDate(transaction.createdAt)}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransaction(transaction)
                            setDetailModalOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination - só mostra se tiver mais de 1 página */}
      {totalPages > 1 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Transaction Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>Informações completas da transação selecionada</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Externo</label>
                  <p className="font-mono text-sm">{selectedTransaction.externalId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div>
                    <Badge className={getTypeColor(selectedTransaction.type)}>
                      {["WIN", "BET", "PAYMENT", "TRANSFER", "VERIFY"].includes(selectedTransaction.type)
                        ? "Aposta"
                        : selectedTransaction.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p className="font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <Badge className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                <p>
                  {selectedTransaction.user.name} ({selectedTransaction.user.email})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p>{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.paymentMethod && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Método de Pagamento</label>
                  <p>{selectedTransaction.paymentMethod}</p>
                </div>
              )}

              {selectedTransaction.pix && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chave PIX</label>
                  <p className="font-mono text-sm">{selectedTransaction.pix}</p>
                </div>
              )}

              {selectedTransaction.scratchCard && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Raspadinha</label>
                  <p>{selectedTransaction.scratchCard.name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p>{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                {selectedTransaction.paidAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pago em</label>
                    <p>{formatDate(selectedTransaction.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
