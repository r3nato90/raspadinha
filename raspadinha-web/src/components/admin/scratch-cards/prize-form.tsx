"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScratchPrize {
  id?: string
  scratchCardId?: string
  image: string
  name: string
  description: string
  type: "MONEY"
  value: number
  rtp: number
}

interface PrizeFormProps {
  prize?: ScratchPrize
  onSave: (data: Partial<ScratchPrize>) => void
  onCancel: () => void
}

export function PrizeForm({ prize, onSave, onCancel }: PrizeFormProps) {
  const [formData, setFormData] = useState<Partial<ScratchPrize>>({
    name: prize?.name || "",
    description: prize?.description || "",
    image: prize?.image || "",
    type: prize?.type || "MONEY",
    value: prize?.value || 0,
    rtp: prize?.rtp || 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Prêmio</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Prêmio</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as "MONEY" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONEY">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input
            id="rtp"
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={formData.rtp}
            onChange={(e) => setFormData({ ...formData, rtp: Number.parseFloat(e.target.value) || 0 })}
            required
          />
          <p className="text-xs text-muted-foreground">Probabilidade de ganhar este prêmio</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            id="image"
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{prize ? "Atualizar" : "Adicionar"}</Button>
      </div>
    </form>
  )
}
