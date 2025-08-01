"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Wallet, LogOut, User, CreditCard, PersonStandingIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginModal } from "@/components/login-modal"
import { RegisterModal } from "@/components/register-modal"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"
import { useUser } from "@/contexts/user-context"
import { useSettings } from "@/contexts/settings-context"

export function Navbar() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const { user, logout, loading } = useUser()

  const handleRegisterSuccess = () => {
    setRegisterModalOpen(false)
    setLoginModalOpen(true)
  }

  const handleLogout = () => {
    logout()
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(balance)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - SÓ A IMAGEM */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src={settings?.logo || '/logo.png'}
                  alt={settings?.siteName || ''}
                  width={100}
                  height={40}
                />
              </Link>
            </div>

            {/* Desktop Auth/User Section */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  {/* Botão Depositar */}
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setDepositModalOpen(true)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Depositar
                  </Button>

                  {/* Dropdown do Usuário */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                        <User className="w-4 h-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{formatBalance(user.balance)}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account">
                          <User className="mr-2 h-4 w-4" />
                          <span>Minha Conta</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDepositModalOpen(true)}>
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Depositar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setWithdrawModalOpen(true)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Sacar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/transactions">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Transações</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/affiliates">
                          <PersonStandingIcon className="mr-2 h-4 w-4" />
                          <span>Afiliado</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <LoginModal isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
                  <RegisterModal
                    isOpen={registerModalOpen}
                    onOpenChange={setRegisterModalOpen}
                    onSuccess={handleRegisterSuccess}
                  />
                </>
              )}
            </div>

            {/* Mobile Section */}
            <div className="md:hidden flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                  <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : user ? (
                /* Mobile menu button quando logado */
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <VisuallyHidden>
                        <SheetTitle>Menu do usuário</SheetTitle>
                      </VisuallyHidden>
                    </SheetHeader>
                    <div className="flex flex-col space-y-6 mt-6">
                      {/* User info mobile */}
                      <div className="border-b border-border pb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <User className="w-8 h-8 p-1 bg-primary/10 text-primary rounded-full" />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{formatBalance(user.balance)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => {
                              setDepositModalOpen(true)
                              setIsOpen(false)
                            }}
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Depositar
                          </Button>
                        </div>
                      </div>

                      {/* User actions mobile - DEPOSITAR EM CIMA DO SACAR */}
                      <div className="space-y-4">
                        <Link
                          href="/account"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span className="text-base font-medium">Minha Conta</span>
                        </Link>
                        <button
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200 w-full text-left"
                          onClick={() => {
                            setDepositModalOpen(true)
                            setIsOpen(false)
                          }}
                        >
                          <Wallet className="w-5 h-5" />
                          <span className="text-base font-medium">Depositar</span>
                        </button>
                        <button
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200 w-full text-left"
                          onClick={() => {
                            setWithdrawModalOpen(true)
                            setIsOpen(false)
                          }}
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="text-base font-medium">Sacar</span>
                        </button>
                        <Link
                          href="/transactions"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="text-base font-medium">Transações</span>
                        </Link>
                        <button
                          className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors duration-200 w-full text-left"
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-base font-medium">Sair</span>
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                /* Botões de login/register quando não logado */
                <div className="flex items-center gap-2">
                  <LoginModal isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
                  <RegisterModal
                    isOpen={registerModalOpen}
                    onOpenChange={setRegisterModalOpen}
                    onSuccess={handleRegisterSuccess}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <DepositModal isOpen={depositModalOpen} onOpenChange={setDepositModalOpen} />
      <WithdrawModal isOpen={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} />
    </>
  )
}
