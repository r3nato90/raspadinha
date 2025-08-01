"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/services/apiClient"
import { hexToHsl } from "@/lib/color-utils"

interface Banner {
  id: string
  title: string
  image: string
  link: string
  active: boolean
  order: number
}

interface Settings {
  siteName: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  banners: Banner[]
}

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  refreshSettings: () => Promise<void>
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultSettings: Settings = {
  siteName: "",
  logo: "/logo.png",
  favicon: "/favicon.ico",
  primaryColor: "#ffffff",
  secondaryColor: "#ffffff",
  banners: [],
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get("/settings")
      const settingsData = response.data.data
      setSettings(settingsData)
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      await apiClient.put("/admin/settings", newSettings)
      await fetchSettings()
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error)
      throw error
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  // Atualizar título da página dinamicamente
  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteName
      document.description = settings.siteName
    }
  }, [settings?.siteName])

  // Aplicar cores CSS
  useEffect(() => {
    if (settings) {
      const primaryHsl = hexToHsl(settings.primaryColor)
      const secondaryHsl = hexToHsl(settings.secondaryColor)

      document.documentElement.style.setProperty("--primary", primaryHsl)
      document.documentElement.style.setProperty("--ring", primaryHsl)
      document.documentElement.style.setProperty("--secondary", secondaryHsl)
    }
  }, [settings])

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      <head>
        <meta name="description" content="Jogue raspadinhas online e ganhe prêmios reais! PIX na conta, produtos incríveis e muito mais. Diversão garantida com segurança total." />
        <meta property="og:title" content={settings?.name || ''} />
        <meta property="og:description" content="Jogue raspadinhas online e ganhe prêmios reais! PIX na conta, produtos incríveis e muito mais. Diversão garantida com segurança total." />
        <meta property="og:image" content={settings?.favicon || '/favicon.ico'} />
        <meta name="twitter:title" content={settings?.name || ''} />
        <meta name="twitter:description" content="Jogue raspadinhas online e ganhe prêmios reais! PIX na conta, produtos incríveis e muito mais. Diversão garantida com segurança total." />
        <meta name="twitter:image" content={settings?.favicon || '/favicon.ico'} />
        <link rel="icon" href={settings?.favicon || '/favicon.ico'} />
      </head>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
