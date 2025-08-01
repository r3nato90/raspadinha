export function hexToHsl(hex: string): string {
    // Remove o # se existir
    hex = hex.replace("#", "")
  
    // Converte hex para RGB
    const r = Number.parseInt(hex.substr(0, 2), 16) / 255
    const g = Number.parseInt(hex.substr(2, 2), 16) / 255
    const b = Number.parseInt(hex.substr(4, 2), 16) / 255
  
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2
  
    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
  
    // Converte para o formato do Tailwind (sem vírgulas)
    const hDeg = Math.round(h * 360)
    const sPercent = Math.round(s * 100)
    const lPercent = Math.round(l * 100)
  
    return `${hDeg} ${sPercent}% ${lPercent}%`
  }
  
  export function hslToHex(hsl: string): string {
    // Parse HSL string "240 100% 50%" para valores
    const parts = hsl.split(" ")
    const h = Number.parseInt(parts[0]) / 360
    const s = Number.parseInt(parts[1]) / 100
    const l = Number.parseInt(parts[2]) / 100
  
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
  
    let r, g, b
  
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
  
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }
  
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
  