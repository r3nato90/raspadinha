interface Prize {
  id: string
  name: string
  image: string
  type: "MONEY"
  value: number
  rtp: number
}

interface ScratchCard {
  id: string
  name: string
  rtp: number
  prizes?: Prize[]
}

export function generateRandomPositions(rtp: number, prizes: Prize[]): string[] {
  const positions = new Array<string>(9)

  // Decide se vai ganhar baseado no RTP
  const willWin = Math.random() * 100 < rtp

  if (willWin && prizes.length > 0) {
    // Escolher prêmio proporcional ao peso do valor e rtp
    const prizePool = prizes.map(prize => ({
      ...prize,
      weight: prize.rtp / prize.value, // quanto mais "barato", mais chance de ser sorteado
    }))

    const totalWeight = prizePool.reduce((sum, p) => sum + p.weight, 0)
    let rand = Math.random() * totalWeight

    let selectedPrize = prizePool[0]
    for (const prize of prizePool) {
      rand -= prize.weight
      if (rand <= 0) {
        selectedPrize = prize
        break
      }
    }

    // Sortear 3 posições aleatórias para prêmio
    const winningPositions: number[] = []
    while (winningPositions.length < 3) {
      const pos = Math.floor(Math.random() * 9)
      if (!winningPositions.includes(pos)) {
        winningPositions.push(pos)
      }
    }

    // Colocar o prêmio sorteado nas posições vencedoras
    winningPositions.forEach((pos) => {
      positions[pos] = selectedPrize.id
    })

    // Preencher posições restantes com outros prêmios
    for (let i = 0; i < 9; i++) {
      if (!positions[i]) {
        const fillerPrizes = prizes.filter(p => p.id !== selectedPrize.id)
        const randomPrize = fillerPrizes[Math.floor(Math.random() * fillerPrizes.length)]
        positions[i] = randomPrize?.id ?? selectedPrize.id
      }
    }

  } else {
    // Jogador não ganha: garantir que nenhum prêmio apareça 3 vezes
    const prizeIds = prizes.map(p => p.id)

    for (let i = 0; i < 9; i++) {
      positions[i] = prizeIds[Math.floor(Math.random() * prizeIds.length)]
    }

    // Corrigir caso algum prêmio apareça >= 3 vezes
    const counts: { [id: string]: number } = {}
    for (const id of positions) {
      counts[id] = (counts[id] || 0) + 1
    }

    for (const id in counts) {
      if (counts[id] >= 3) {
        let replaced = 0
        for (let i = 0; i < 9 && replaced < counts[id] - 2; i++) {
          if (positions[i] === id) {
            const alternatives = prizeIds.filter(p => p !== id)
            positions[i] = alternatives[Math.floor(Math.random() * alternatives.length)]
            replaced++
          }
        }
      }
    }
  }

  return positions
}

export function generateRandomPrize(card: ScratchCard): Prize | null {
  if (!card.prizes || card.prizes.length === 0) {
    return null
  }

  // Simular se ganhou baseado no RTP
  const willWin = Math.random() * 100 < card.rtp

  if (!willWin) {
    return null
  }

  // Escolher prêmio baseado no RTP individual
  const totalRtp = card.prizes.reduce((sum, prize) => sum + prize.rtp, 0)
  let random = Math.random() * totalRtp

  for (const prize of card.prizes) {
    random -= prize.rtp
    if (random <= 0) {
      return prize
    }
  }

  return card.prizes[0]
}
