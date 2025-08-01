"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Users, CreditCard, Gamepad2, BarChart3, Home } from "lucide-react"
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
]

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden mb-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Menu className="mr-2 h-4 w-4" />
            Menu Admin
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Admin Panel
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-2 mt-6">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start mb-4 bg-transparent">
                <Home className="mr-3 h-4 w-4" />
                Voltar ao Site
              </Button>
            </Link>

            {adminNavigation.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
