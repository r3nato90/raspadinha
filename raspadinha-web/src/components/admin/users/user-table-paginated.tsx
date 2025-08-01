"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"

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

interface UserTablePaginatedProps {
  users: User[]
  loading?: boolean
  totalItems: number
  onEditUser: (user: User) => void
}

export function UserTablePaginated({ users, loading = false, totalItems, onEditUser }: UserTablePaginatedProps) {
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Usuários ({totalItems})</CardTitle>
        <CardDescription>Todos os usuários cadastrados na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Saldo</th>
                <th className="text-left p-2">Cadastro</th>
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
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-2">
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-2">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2 text-muted-foreground">{user.email}</td>
                    <td className="p-2">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                    </td>
                    <td className="p-2">{formatBalance(user.balance)}</td>
                    <td className="p-2 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
