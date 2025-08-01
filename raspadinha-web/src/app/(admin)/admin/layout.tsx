"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Container } from "@/components/container"
import { UserProvider, useUser } from "@/contexts/user-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { apiClient } from "@/services/apiClient"
import "../../globals.css"

const inter = Inter({ subsets: ["latin"] })

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        // Validar token e verificar se é admin
        const response = await apiClient.get("/accounts/me")

        if (response.data?.role !== "ADMIN") {
          router.push("/")
          return
        }

        setIsValidating(false)
      } catch (error) {
        console.error("Erro na validação admin:", error)
        // Remove token inválido
        sessionStorage.removeItem("token")
        delete apiClient.defaults.headers.common["Authorization"]
        router.push("/")
      }
    }

    if (!loading) {
      validateAdmin()
    }
  }, [loading, router])

  // Mostrar loading enquanto valida
  if (loading || isValidating) {
    return null
  }

  // Se chegou até aqui, é admin válido
  return <>{children}</>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <UserProvider>
              <AdminGuard>
                <Navbar />
                <Container className="py-6">
                  {/* Mobile Navigation - Sempre visível */}
                  <div className="md:hidden mb-6">
                    <AdminSidebar />
                  </div>

                  <div className="flex gap-6">
                    {/* Desktop Navigation */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                      <AdminSidebar />
                    </div>

                    <main className="flex-1 min-w-0">{children}</main>
                  </div>
                </Container>
                <Footer />
                <Toaster />
              </AdminGuard>
            </UserProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
