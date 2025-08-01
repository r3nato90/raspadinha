import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/contexts/user-context"
import { SettingsProvider } from "@/contexts/settings-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <UserProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </UserProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
