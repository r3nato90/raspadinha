"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "USER" | "ADMIN"
  balance: number
  affiliateCode: string
  affiliateRate: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

interface EditUserFormProps {
  user: User
  onSave: (data: Partial<User>) => void
  onCancel: () => void
}

export function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    balance: user.balance,
    affiliateCode: user.affiliateCode,
    affiliateRate: user.affiliateRate
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as "USER" | "ADMIN" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">Saldo</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: Number.parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="affiliateCode">Código de Afiliado</Label>
        <Input
          id="affiliateCode"
          value={formData.affiliateCode}
          onChange={(e) => setFormData({ ...formData, affiliateCode: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="affiliateRate">Comissão (%)</Label>
        <Input
          id="affiliateRate"
          type="number"
          step="0.01"
          value={formData.affiliateRate}
          onChange={(e) => setFormData({ ...formData, affiliateRate: Number.parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}
