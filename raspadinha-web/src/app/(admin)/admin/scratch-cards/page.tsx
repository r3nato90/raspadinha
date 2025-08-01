"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Eye, Plus, Trash2, Award, Loader2 } from "lucide-react"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { PrizeForm } from "@/components/admin/scratch-cards/prize-form"

interface ScratchPrize {
  id: string
  scratchCardId: string
  image: string
  name: string
  description: string
  type: "MONEY"
  value: number
  rtp: number
  createdAt: string
  updatedAt: string
}

interface ScratchCard {
  id: string
  amount: number
  name: string
  description: string
  image: string
  status: "ACTIVE" | "INACTIVE" | "DRAFT"
  rtp: number
  prizes: ScratchPrize[]
  createdAt: string
  updatedAt: string
}

export default function ScratchCardsPage() {
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [prizeModalOpen, setPrizeModalOpen] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<ScratchPrize | null>(null)
  const { toast } = useToast()

  const fetchScratchCards = async () => {
    try {
      const response = await apiClient.get("/admin/scratch-cards")
      setScratchCards(response.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar raspadinhas",
        description: "Não foi possível carregar a lista de raspadinhas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScratchCards()
  }, [])

  const filteredCards = scratchCards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCard = async (cardData: Partial<ScratchCard>) => {
    try {
      await apiClient.post("/admin/scratch-cards", cardData)
      toast({
        title: "Raspadinha criada",
        description: "A raspadinha foi criada com sucesso",
      })
      fetchScratchCards()
      setCreateModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao criar raspadinha",
        description: "Não foi possível criar a raspadinha",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditCard = async (cardData: Partial<ScratchCard>) => {
    if (!selectedCard) return

    try {
      await apiClient.put(`/admin/scratch-cards/${selectedCard.id}`, cardData)
      toast({
        title: "Raspadinha atualizada",
        description: "A raspadinha foi atualizada com sucesso",
      })
      fetchScratchCards()
      setEditModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao atualizar raspadinha",
        description: "Não foi possível atualizar a raspadinha",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta raspadinha?")) return

    try {
      await apiClient.delete(`/admin/scratch-cards/${cardId}`)
      toast({
        title: "Raspadinha excluída",
        description: "A raspadinha foi excluída com sucesso",
      })
      fetchScratchCards()
    } catch (error) {
      toast({
        title: "Erro ao excluir raspadinha",
        description: "Não foi possível excluir a raspadinha",
        variant: "destructive",
      })
    }
  }

  const handleCreatePrize = async (prizeData: Partial<ScratchPrize>) => {
    if (!selectedCard) return

    try {
      await apiClient.post(`/admin/scratch-cards/${selectedCard.id}/prizes`, prizeData)
      toast({
        title: "Prêmio adicionado",
        description: "O prêmio foi adicionado com sucesso",
      })

      await fetchScratchCards()
      const updatedResponse = await apiClient.get(`/admin/scratch-cards/${selectedCard.id}`)
      setSelectedCard(updatedResponse.data)

      setPrizeModalOpen(false)
      setSelectedPrize(null)
    } catch (error) {
      toast({
        title: "Erro ao adicionar prêmio",
        description: "Não foi possível adicionar o prêmio",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditPrize = async (prizeData: Partial<ScratchPrize>) => {
    if (!selectedCard || !selectedPrize) return

    try {
      await apiClient.put(`/admin/scratch-cards/${selectedCard.id}/prizes/${selectedPrize.id}`, prizeData)
      toast({
        title: "Prêmio atualizado",
        description: "O prêmio foi atualizado com sucesso",
      })

      await fetchScratchCards()
      const updatedResponse = await apiClient.get(`/admin/scratch-cards/${selectedCard.id}`)
      setSelectedCard(updatedResponse.data)

      setPrizeModalOpen(false)
      setSelectedPrize(null)
    } catch (error) {
      toast({
        title: "Erro ao atualizar prêmio",
        description: "Não foi possível atualizar o prêmio",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeletePrize = async (prizeId: string) => {
    if (!selectedCard) return
    if (!confirm("Tem certeza que deseja excluir este prêmio?")) return

    try {
      await apiClient.delete(`/admin/scratch-cards/${selectedCard.id}/prizes/${prizeId}`)
      toast({
        title: "Prêmio excluído",
        description: "O prêmio foi excluído com sucesso",
      })

      await fetchScratchCards()
      const updatedResponse = await apiClient.get(`/admin/scratch-cards/${selectedCard.id}`)
      setSelectedCard(updatedResponse.data)
    } catch (error) {
      toast({
        title: "Erro ao excluir prêmio",
        description: "Não foi possível excluir o prêmio",
        variant: "destructive",
      })
    }
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
      case "ACTIVE":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "INACTIVE":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Raspadinhas</h1>
          <p className="text-muted-foreground">Gerencie todas as raspadinhas da plataforma</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Raspadinha
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Raspadinhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <div className="relative">
              <img src={card.image || "/placeholder.svg"} alt={card.name} className="w-full h-48 object-cover" />
              <Badge className={`absolute top-2 right-2 ${getStatusColor(card.status)}`}>{card.status}</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate">{card.name}</span>
                <span className="text-primary font-bold">{formatCurrency(card.amount)}</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">RTP: {card.rtp}%</span>
                <span className="text-sm text-muted-foreground">{card.prizes?.length || 0} prêmios</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCard(card)
                    setDetailModalOpen(true)
                  }}
                  title="Ver detalhes e gerenciar prêmios"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCard(card)
                    setEditModalOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteCard(card.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Raspadinha</DialogTitle>
            <DialogDescription>Crie uma nova raspadinha para a plataforma</DialogDescription>
          </DialogHeader>
          <ScratchCardForm onSave={handleCreateCard} onCancel={() => setCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Raspadinha</DialogTitle>
            <DialogDescription>Edite as informações da raspadinha selecionada</DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <ScratchCardForm card={selectedCard} onSave={handleEditCard} onCancel={() => setEditModalOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Raspadinha</DialogTitle>
            <DialogDescription>Informações completas da raspadinha selecionada</DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="prizes">Prêmios ({selectedCard.prizes?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="font-medium">{selectedCard.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preço</label>
                    <p className="font-medium">{formatCurrency(selectedCard.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedCard.status)}>{selectedCard.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RTP</label>
                    <p>{selectedCard.rtp}%</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p>{selectedCard.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Imagem</label>
                  <img
                    src={selectedCard.image || "/placeholder.svg"}
                    alt={selectedCard.name}
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                    <p>{formatDate(selectedCard.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                    <p>{formatDate(selectedCard.updatedAt)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prizes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Prêmios ({selectedCard.prizes?.length || 0})</h3>
                  <Button
                    onClick={() => {
                      setSelectedPrize(null)
                      setPrizeModalOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Prêmio
                  </Button>
                </div>

                {selectedCard.prizes && selectedCard.prizes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCard.prizes.map((prize) => (
                      <Card key={prize.id} className="overflow-hidden">
                        <div className="relative h-32">
                          <img
                            src={prize.image || "/placeholder.svg"}
                            alt={prize.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
                              prize.type === "MONEY"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {prize.type === "MONEY" ? "Dinheiro" : "Produto"}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{prize.name}</h4>
                            <span className="text-primary font-bold">{formatCurrency(prize.value)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{prize.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">RTP: {prize.rtp}%</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPrize(prize)
                                  setPrizeModalOpen(true)
                                }}
                                title="Editar prêmio"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePrize(prize.id)}
                                className="text-red-500 hover:text-red-600"
                                title="Excluir prêmio"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <Award className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Nenhum prêmio cadastrado</p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => {
                        setSelectedPrize(null)
                        setPrizeModalOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Prêmio
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={prizeModalOpen} onOpenChange={setPrizeModalOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrize ? "Editar Prêmio" : "Adicionar Prêmio"}</DialogTitle>
            <DialogDescription>
              {selectedPrize
                ? "Edite as informações do prêmio selecionado"
                : "Adicione um novo prêmio para esta raspadinha"}
            </DialogDescription>
          </DialogHeader>
          <PrizeForm
            prize={selectedPrize || undefined}
            onSave={selectedPrize ? handleEditPrize : handleCreatePrize}
            onCancel={() => {
              setPrizeModalOpen(false)
              setSelectedPrize(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ScratchCardForm({
  card,
  onSave,
  onCancel,
}: {
  card?: ScratchCard
  onSave: (data: Partial<ScratchCard>) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: card?.name || "",
    description: card?.description || "",
    amount: card?.amount || 0,
    image: card?.image || "",
    status: card?.status || "ACTIVE",
    rtp: card?.rtp || 80,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error("Erro ao salvar raspadinha:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Preço (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rtp">RTP (%)</Label>
          <Input
            id="rtp"
            type="number"
            min="1"
            max="100"
            value={formData.rtp}
            onChange={(e) => setFormData({ ...formData, rtp: Number.parseInt(e.target.value) || 80 })}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL da Imagem</Label>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {card ? "Atualizando..." : "Criando..."}
            </>
          ) : card ? (
            "Atualizar"
          ) : (
            "Criar"
          )}
        </Button>
      </div>
    </form>
  )
}
