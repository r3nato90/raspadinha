"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/services/apiClient"
import type { IUser } from "@/types/user"

interface UserContextType {
  user: IUser | null
  setUser: (user: IUser | null) => void
  loading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    delete apiClient.defaults.headers.common["Authorization"]
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      // Configura o token no axios
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

      const response = await apiClient.get("/accounts/me")
      setUser(response.data)
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      logout() // Remove token inválido
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = {
    user,
    setUser,
    loading,
    logout,
    refreshUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
