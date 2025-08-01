"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, CreditCard, Gamepad2, BarChart3, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const adminNavigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Transações",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    name: "Raspadinhas",
    href: "/admin/scratch-cards",
    icon: Gamepad2,
  },
  {
    name: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start mb-4 bg-transparent">
            <Home className="mr-3 h-4 w-4" />
            Voltar ao Site
          </Button>
        </Link>

        {adminNavigation.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
              >
                <IconComponent className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
