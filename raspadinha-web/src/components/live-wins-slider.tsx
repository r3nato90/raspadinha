"use client"

import { useState, useEffect } from "react"
import { Trophy, Coins } from "lucide-react"

interface LiveWin {
  id: string
  playerName: string
  amount: number
  scratchCard: string
  timestamp: Date
}

const fakeWins: LiveWin[] = [
  { id: "1", playerName: "João S****", amount: 150.0, scratchCard: "Tesouro Dourado", timestamp: new Date() },
  { id: "2", playerName: "Maria O*****", amount: 89.5, scratchCard: "Sorte Grande", timestamp: new Date() },
  { id: "3", playerName: "Pedro L***", amount: 245.0, scratchCard: "Diamante Real", timestamp: new Date() },
  { id: "4", playerName: "Ana C******", amount: 67.8, scratchCard: "Fortuna", timestamp: new Date() },
  { id: "5", playerName: "Carlos M****", amount: 320.0, scratchCard: "Mega Prêmio", timestamp: new Date() },
  { id: "6", playerName: "Lucia F*****", amount: 125.3, scratchCard: "Ouro Verde", timestamp: new Date() },
  { id: "7", playerName: "Roberto A***", amount: 98.75, scratchCard: "Super Sorte", timestamp: new Date() },
  { id: "8", playerName: "Fernanda S****", amount: 180.0, scratchCard: "Jackpot", timestamp: new Date() },
]

export function LiveWinsSlider() {
  const [currentWinIndex, setCurrentWinIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentWinIndex((prev) => (prev + 1) % fakeWins.length)
        setIsVisible(true)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const currentWin = fakeWins[currentWinIndex]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-foreground">🎉 Ganhos ao Vivo</h3>
      </div>

      <div
        className={`transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">{currentWin.playerName}</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatTime(currentWin.timestamp)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ganhou em</p>
              <p className="font-medium text-foreground">{currentWin.scratchCard}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">{formatCurrency(currentWin.amount)}</p>
              <p className="text-xs text-muted-foreground">há poucos minutos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 gap-1">
        {fakeWins.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentWinIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
