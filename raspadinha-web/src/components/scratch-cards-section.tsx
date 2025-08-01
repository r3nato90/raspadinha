"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/services/apiClient"
import { useToast } from "@/hooks/use-toast"
import { ScratchCardModal } from "@/components/scratch-card-modal"

const categories = [
  { id: "all", label: "Todos", active: true },
]

interface ScratchCard {
  id: string
  amount: number
  name: string
  description: string
  image: string
  status: "ACTIVE" | "INACTIVE" | "DRAFT"
  rtp: number
}

export function ScratchCardsSection() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchScratchCards = async () => {
    try {
      const response = await apiClient.get("/scratch-cards")
      setScratchCards(response.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar raspadinhas",
        description: "Não foi possível carregar as raspadinhas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScratchCards()
  }, [])

  const filteredCards = scratchCards.filter((card) => {
    if (activeCategory === "all") return card.status === "ACTIVE"
    return card.status === "ACTIVE" && card.category === activeCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Raspadinhas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Raspadinhas</h2>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all duration-200 text-sm sm:text-base flex-1 sm:flex-none ${
                  activeCategory === category.id
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={card.image || "/placeholder.svg?height=200&width=300"}
                  alt={card.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg`}
                >
                  Dinheiro
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <h3 className="text-foreground font-semibold text-base sm:text-lg mb-1 truncate" title={card.name}>
                  {card.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2" title={card.description}>
                  {card.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold text-base sm:text-lg">{formatCurrency(card.amount)}</span>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => {
                      setSelectedCard(card)
                      setModalOpen(true)
                    }}
                  >
                    Jogar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma raspadinha encontrada nesta categoria.</p>
          </div>
        )}
      </div>
      {/* Modal de Raspadinha */}
      <ScratchCardModal isOpen={modalOpen} onOpenChange={setModalOpen} scratchCard={selectedCard} />
    </section>
  )
}
