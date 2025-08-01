"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, X, Trophy, Coins } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiClient"
import { useUser } from "@/contexts/user-context"

// 🔥 DEBUG MODE - Ative para ver logs detalhados
const DEBUG_MODE = true

const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log("🎮 [SCRATCH DEBUG]", ...args)
  }
}

interface ScratchCard {
  id: string
  name: string
  description: string
  amount: number
  image: string
}

interface Prize {
  id: string
  name: string
  image: string
  type: "MONEY"
  value: number
}

interface ScratchCardGame {
  gameId: string
  transactionId: string
  prizes: Prize[]
  positions: string[] // Array de 9 posições com os IDs dos prêmios
}

interface ScratchCardModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  scratchCard: ScratchCard | null
}

export function ScratchCardModal({ isOpen, onOpenChange, scratchCard }: ScratchCardModalProps) {
  const [step, setStep] = useState<"confirm" | "playing" | "result">("confirm")
  const [loading, setLoading] = useState(false)
  const [gameData, setGameData] = useState<ScratchCardGame | null>(null)
  const [isScratching, setIsScratching] = useState(false)
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null)
  const [scratchProgress, setScratchProgress] = useState(0)
  const [hasCheckedWin, setHasCheckedWin] = useState(false)
  const [isProcessingResult, setIsProcessingResult] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameDataRef = useRef<ScratchCardGame | null>(null) // 🔥 REF PARA PERSISTIR DADOS
  const { toast } = useToast()
  const { user, refreshUser } = useUser()

  // 🔥 SINCRONIZAR REF COM STATE
  useEffect(() => {
    gameDataRef.current = gameData
    debugLog("🔄 GameData atualizado:", { gameData, ref: gameDataRef.current })
  }, [gameData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const handlePurchase = async () => {
    debugLog("🛒 Iniciando compra da raspadinha", { scratchCard, user })

    if (!scratchCard || !user) {
      debugLog("❌ Dados inválidos para compra", { scratchCard: !!scratchCard, user: !!user })
      return
    }

    if (user.balance < scratchCard.amount) {
      debugLog("❌ Saldo insuficiente", { balance: user.balance, required: scratchCard.amount })
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para comprar esta raspadinha",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      debugLog("📡 Enviando requisição para comprar raspadinha...")
      const response = await apiClient.post(`/scratch-cards/${scratchCard.id}/play`)
      debugLog("✅ Resposta da API recebida:", response.data)

      const newGameData = response.data
      setGameData(newGameData)
      gameDataRef.current = newGameData // 🔥 ATUALIZAR REF IMEDIATAMENTE

      setStep("playing")
      setHasCheckedWin(false)
      setIsProcessingResult(false)
      setScratchProgress(0)

      debugLog("🎮 Estado após compra:", {
        gameData: newGameData,
        ref: gameDataRef.current,
        step: "playing",
      })

      // Atualizar saldo do usuário
      await refreshUser()

      toast({
        title: "Raspadinha comprada! 🎉",
        description: "Agora raspe para descobrir se você ganhou!",
      })
    } catch (error: any) {
      debugLog("❌ Erro ao comprar raspadinha:", error)
      toast({
        title: "Erro ao comprar raspadinha",
        description: error.response?.data?.message || "Não foi possível comprar a raspadinha",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeCanvas = () => {
    debugLog("🎨 Inicializando canvas...")
    const canvas = canvasRef.current
    if (!canvas) {
      debugLog("❌ Canvas não encontrado")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      debugLog("❌ Contexto 2D não encontrado")
      return
    }

    // Configurar canvas
    canvas.width = 400
    canvas.height = 400

    // 🎨 VISUAL MELHORADO - Gradiente prateado
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#e2e8f0")
    gradient.addColorStop(0.5, "#cbd5e1")
    gradient.addColorStop(1, "#94a3b8")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Adicionar textura metálica
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 2 + 1
      ctx.fillRect(x, y, size, size)
    }

    // Adicionar sombras para profundidade
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 3 + 1
      ctx.fillRect(x, y, size, size)
    }

    // Texto principal
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 28px Arial"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
    ctx.shadowBlur = 2
    ctx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2 - 20)

    // Subtexto
    ctx.font = "18px Arial"
    ctx.fillStyle = "#475569"
    ctx.fillText("🪙 Boa sorte! 🪙", canvas.width / 2, canvas.height / 2 + 20)

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0

    debugLog("✅ Canvas inicializado com sucesso")
  }

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const canvasX = (x - rect.left) * scaleX
    const canvasY = (y - rect.top) * scaleY

    // 🔥 EFEITO DE RASPAGEM MELHORADO
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(canvasX, canvasY, 25, 0, 2 * Math.PI)
    ctx.fill()

    // Adicionar efeito de "faísca"
    for (let i = 0; i < 3; i++) {
      const sparkX = canvasX + (Math.random() - 0.5) * 40
      const sparkY = canvasY + (Math.random() - 0.5) * 40
      ctx.beginPath()
      ctx.arc(sparkX, sparkY, Math.random() * 3 + 1, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // 🚀 VERIFICAÇÃO DE PROGRESSO OTIMIZADA
  const checkScratchProgress = useCallback(() => {
    debugLog("🔍 Verificando progresso da raspagem...")
    debugLog("🔍 Estados atuais:", {
      hasCheckedWin,
      isProcessingResult,
      gameData: !!gameData,
      gameDataRef: !!gameDataRef.current,
      step,
    })

    const canvas = canvasRef.current
    if (!canvas) {
      debugLog("❌ Canvas não encontrado para verificação")
      return
    }

    if (hasCheckedWin) {
      debugLog("⏭️ Já verificou vitória, pulando...")
      return
    }

    if (isProcessingResult) {
      debugLog("⏳ Já está processando resultado, pulando...")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      debugLog("❌ Contexto 2D não encontrado para verificação")
      return
    }

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      let transparentPixels = 0

      // Verificar apenas uma amostra dos pixels para performance
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) {
          transparentPixels++
        }
      }

      const totalSamples = Math.floor(pixels.length / 16)
      const scratchedPercentage = (transparentPixels / totalSamples) * 100

      debugLog("📊 Progresso atual:", {
        transparentPixels,
        totalSamples,
        scratchedPercentage: scratchedPercentage.toFixed(2),
      })

      setScratchProgress(scratchedPercentage)

      // 🎯 VERIFICAR VITÓRIA COM 60% DE PROGRESSO
      if (scratchedPercentage >= 60 && !hasCheckedWin && !isProcessingResult) {
        debugLog("🎯 Atingiu 60% de progresso! Verificando vitória...")
        debugLog("🎯 Dados disponíveis:", {
          gameData: !!gameData,
          gameDataRef: !!gameDataRef.current,
          gameDataContent: gameDataRef.current,
        })

        setHasCheckedWin(true)
        setIsProcessingResult(true)

        // 🔥 USAR TIMEOUT PARA GARANTIR QUE OS ESTADOS SEJAM ATUALIZADOS
        setTimeout(() => {
          checkForWin()
        }, 100)
      }
    } catch (error) {
      debugLog("❌ Erro ao verificar progresso:", error)
    }
  }, [hasCheckedWin, isProcessingResult, gameData, step])

  // Debounce da verificação de progresso
  const debouncedProgressCheck = useCallback(debounce(checkScratchProgress, 150), [checkScratchProgress])

  const checkForWin = async () => {
    debugLog("🏆 Iniciando verificação de vitória...")

    // 🔥 USAR REF COMO FALLBACK
    const currentGameData = gameData || gameDataRef.current

    debugLog("🏆 Dados do jogo:", {
      fromState: !!gameData,
      fromRef: !!gameDataRef.current,
      currentGameData: !!currentGameData,
      data: currentGameData,
    })

    if (!currentGameData) {
      debugLog("❌ Dados do jogo não encontrados em lugar nenhum!")
      debugLog("❌ Estados atuais:", {
        gameData,
        gameDataRef: gameDataRef.current,
        step,
        hasCheckedWin,
        isProcessingResult,
      })
      setIsProcessingResult(false)
      setHasCheckedWin(false)
      return
    }

    try {
      debugLog("🔢 Contando prêmios nas posições:", currentGameData.positions)
    
      const prizeCount: { [key: string]: number } = {}
      currentGameData.positions.forEach((prizeId) => {
        prizeCount[prizeId] = (prizeCount[prizeId] || 0) + 1
      })
    
      debugLog("📈 Contagem de prêmios:", prizeCount)
    
      const winningPrizeId = Object.keys(prizeCount).find((prizeId) => prizeCount[prizeId] >= 3)
      debugLog("🎲 Prêmio vencedor encontrado:", winningPrizeId)
    
      if (winningPrizeId) {
        const prize = currentGameData.prizes.find((p) => p.id === winningPrizeId)
        debugLog("🏆 Dados do prêmio:", prize)
    
        if (prize) {
          setWinningPrize(prize)
    
          debugLog("📡 Enviando requisição para reivindicar prêmio...")
    
          const claimResponse = await apiClient.post(`/scratch-cards/games/${currentGameData.gameId}/claim`, {
            transactionId: currentGameData.transactionId,
            prizeId: winningPrizeId,
            positions: currentGameData.positions,
            scratchedPercentage: 70,
          })
    
          debugLog("✅ Resposta da reivindicação:", claimResponse.data)
    
          await refreshUser()
    
          setTimeout(() => {
            toast({
              title: "🎉 PARABÉNS! VOCÊ GANHOU! 🎉",
              description: `Você ganhou: ${prize.name} - ${formatCurrency(prize.value)}`,
            })
            setStep("result")
            setIsProcessingResult(false)
          }, 4000)
        }
      } else {
        debugLog("😔 Nenhum prêmio vencedor encontrado")
        debugLog("📡 Finalizando transação sem prêmio...")
    
        const claimResponse = await apiClient.post(`/scratch-cards/games/${currentGameData.gameId}/claim`, {
          transactionId: currentGameData.transactionId,
          prizeId: null,
          positions: currentGameData.positions,
          scratchedPercentage: 70,
        })
    
        debugLog("✅ Transação finalizada:", claimResponse.data)
    
        setTimeout(() => {
          toast({
            title: "Que pena! 😔",
            description: "Desta vez não foi, mas continue tentando!",
          })
          setStep("result")
          setIsProcessingResult(false)
        }, 4000)
      }
    } catch (error) {
      debugLog("❌ Erro ao processar resultado:", error)
      setIsProcessingResult(false)
      setHasCheckedWin(false)

      toast({
        title: "Erro ao processar resultado",
        description: "Houve um erro. Entre em contato com o suporte.",
        variant: "destructive",
      })
    }
  }

  // 🎮 EVENTOS DE MOUSE OTIMIZADOS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasCheckedWin || isProcessingResult) {
      debugLog("🚫 Raspagem bloqueada - já processando resultado")
      return
    }
    debugLog("🖱️ Mouse down - iniciando raspagem")
    setIsScratching(true)
    scratch(e.clientX, e.clientY)
    debouncedProgressCheck()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching && !hasCheckedWin && !isProcessingResult) {
      scratch(e.clientX, e.clientY)
      debouncedProgressCheck()
    }
  }

  const handleMouseUp = () => {
    debugLog("🖱️ Mouse up - parando raspagem")
    setIsScratching(false)
  }

  // 📱 EVENTOS DE TOUCH OTIMIZADOS
  const handleTouchStart = (e: React.TouchEvent) => {
    if (hasCheckedWin || isProcessingResult) {
      debugLog("🚫 Touch bloqueado - já processando resultado")
      return
    }
    debugLog("👆 Touch start - iniciando raspagem")
    e.preventDefault()
    setIsScratching(true)
    const touch = e.touches[0]
    scratch(touch.clientX, touch.clientY)
    debouncedProgressCheck()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (isScratching && !hasCheckedWin && !isProcessingResult) {
      const touch = e.touches[0]
      scratch(touch.clientX, touch.clientY)
      debouncedProgressCheck()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    debugLog("👆 Touch end - parando raspagem")
    e.preventDefault()
    setIsScratching(false)
  }

  const handleClose = () => {
    if (step === "playing" && !hasCheckedWin && !isProcessingResult) {
      if (confirm("Tem certeza que deseja sair? Você perderá esta raspadinha!")) {
        debugLog("🚪 Usuário confirmou saída durante o jogo")
        resetModal()
        onOpenChange(false)
      }
    } else {
      debugLog("🚪 Fechando modal")
      resetModal()
      onOpenChange(false)
    }
  }

  const resetModal = () => {
    debugLog("🔄 Resetando modal")
    setStep("confirm")
    setGameData(null)
    gameDataRef.current = null // 🔥 LIMPAR REF TAMBÉM
    setWinningPrize(null)
    setIsScratching(false)
    setScratchProgress(0)
    setHasCheckedWin(false)
    setIsProcessingResult(false)
  }

  useEffect(() => {
    if (step === "playing" && canvasRef.current) {
      debugLog("🎮 Entrando no modo de jogo")
      debugLog("🎮 Dados do jogo disponíveis:", {
        gameData: !!gameData,
        gameDataRef: !!gameDataRef.current,
      })
      initializeCanvas()
    }
  }, [step])

  // 🔄 Reset quando modal abre/fecha
  useEffect(() => {
    if (!isOpen) {
      debugLog("🔄 Modal fechado - resetando estados")
      resetModal()
    }
  }, [isOpen])

  if (!scratchCard) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Comprar Raspadinha</DialogTitle>
              <DialogDescription className="text-center">
                Tem certeza que deseja comprar esta raspadinha?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={scratchCard.image || "/placeholder.svg?height=200&width=300"}
                  alt={scratchCard.name}
                  className="w-full max-w-sm mx-auto h-48 object-cover rounded-lg"
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{scratchCard.name}</h3>
                <p className="text-muted-foreground">{scratchCard.description}</p>
                <div className="text-3xl font-bold text-primary">{formatCurrency(scratchCard.amount)}</div>
              </div>

              {user && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Seu saldo atual:</p>
                  <p className="text-lg font-bold">{formatCurrency(user.balance)}</p>
                  {user.balance < scratchCard.amount && <p className="text-sm text-red-500 mt-2">Saldo insuficiente</p>}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={loading || !user || user.balance < scratchCard.amount}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Comprando...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Comprar Raspadinha
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "playing" && (gameData || gameDataRef.current) && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Raspe para Descobrir!</DialogTitle>
              <DialogDescription className="text-center">
                Encontre 3 símbolos iguais para ganhar o prêmio
              </DialogDescription>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="space-y-4">
              {/* Barra de progresso */}
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-green-500 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(scratchProgress, 100)}%` }}
                >
                  {scratchProgress >= 10 && (
                    <span className="text-xs font-bold text-white">{Math.round(scratchProgress)}%</span>
                  )}
                </div>
              </div>

              <div className="relative mx-auto w-fit">
                {/* Grid de prêmios (por baixo do canvas) */}
                <div className="grid grid-cols-3 gap-1 w-[400px] h-[400px] p-2 bg-white rounded-lg border-2 border-gray-300">
                  {(gameData || gameDataRef.current)?.positions.map((prizeId, index) => {
                    const currentData = gameData || gameDataRef.current
                    const prize = currentData?.prizes.find((p) => p.id === prizeId)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300 rounded-lg p-2"
                      >
                        {prize && (
                          <div className="text-center">
                            <img
                              src={prize.image || "/placeholder.svg?height=40&width=40"}
                              alt={prize.name}
                              className="w-8 h-8 mx-auto mb-1"
                            />
                            <p className="text-xs font-bold text-gray-800 truncate">{prize.name}</p>
                            <p className="text-xs text-green-700 font-semibold">{formatCurrency(prize.value)}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Canvas de raspagem (por cima) */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 cursor-crosshair touch-none rounded-lg"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  💡 Dica: Segure e arraste para raspar • Progresso: {Math.round(scratchProgress)}%
                </p>
                {isProcessingResult && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm text-primary font-medium">🔍 Verificando resultado...</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {step === "result" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {winningPrize ? "🎉 PARABÉNS! 🎉" : "😔 Que pena!"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {winningPrize ? "Você ganhou um prêmio!" : "Desta vez não foi, mas continue tentando!"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 text-center">
              {winningPrize ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{winningPrize.name}</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(winningPrize.value)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {winningPrize.type === "MONEY"
                        ? "Valor adicionado ao seu saldo!"
                        : "Produto será enviado em breve!"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl">😔</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Não foi desta vez!</h3>
                    <p className="text-muted-foreground">Continue tentando, a sorte pode estar na próxima!</p>
                  </div>
                </div>
              )}

              <Button onClick={() => onOpenChange(false)} className="w-full">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// 🛠️ FUNÇÃO DEBOUNCE PARA OTIMIZAÇÃO
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }) as T
}
