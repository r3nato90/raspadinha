"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserSearch } from "@/components/admin/users/user-search"
import { UserTablePaginated } from "@/components/admin/users/user-table-paginated"
import { EditUserForm } from "@/components/admin/users/edit-user-form"
import { CustomPagination } from "@/components/custom-pagination"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "USER" | "ADMIN"
  balance: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

interface PaginatedResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const { toast } = useToast()

  const itemsPerPage = 10

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
      })

      const response = await apiClient.get<PaginatedResponse>(`/admin/users?${params}`)

      if (response.data && response.data.data) {
        setUsers(response.data.data)
        setCurrentPage(response.data.pagination.page)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.total)
      } else {
        // Fallback para API sem paginação
        setUsers(response.data || [])
        setTotalItems(response.data?.length || 0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      })
      // Definir valores padrão em caso de erro
      setUsers([])
      setTotalItems(0)
      setTotalPages(1)
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm)
  }

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return

    try {
      await apiClient.put(`/admin/users/${selectedUser.id}`, userData)
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso",
      })
      fetchUsers(currentPage, searchTerm)
      setEditModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar as informações do usuário",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
        <p className="text-muted-foreground">Gerencie todos os usuários da plataforma</p>
      </div>

      {/* Search */}
      <UserSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Users Table */}
      <UserTablePaginated
        users={users}
        loading={loading}
        totalItems={totalItems}
        onEditUser={(user) => {
          setSelectedUser(user)
          setEditModalOpen(true)
        }}
      />

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

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Edite as informações do usuário selecionado</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <EditUserForm user={selectedUser} onSave={handleEditUser} onCancel={() => setEditModalOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
