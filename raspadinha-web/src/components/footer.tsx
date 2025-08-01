"use client"

import Link from "next/link"
import { Instagram, Lock, ShieldCheck, CreditCard, Heart, Sparkles } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import footerConfig from "@/config/footer.json"

const iconMap = {
  Lock,
  ShieldCheck,
  CreditCard,
}

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="relative bg-gradient-to-b from-muted/30 to-muted/60 border-t border-border">
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {settings?.logo ? (
                <img
                  src={settings.logo || "/placeholder.svg"}
                  alt="Logo"
                  className="w-[100px]"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xl">R</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              A plataforma de raspadinhas online mais confiável do Brasil. Diversão garantida com prêmios incríveis!
            </p>

            {/* Social */}
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-background/80 hover:bg-primary/20 border border-border hover:border-primary/50 rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md">
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Links Sections */}
          {footerConfig.sections.map((section, index) => (
            <div key={index} className="relative">
              {/* Linha decorativa */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-primary/30 rounded-full"></div>
                  <Sparkles className="w-3 h-3 text-primary/60" />
                </div>
              </div>

              <h4 className="text-foreground font-semibold text-sm mb-4 relative">{section.title}</h4>

              <ul className="space-y-3">
                {section.links.slice(0, 3).map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-all duration-200 text-sm flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-primary/40 rounded-full group-hover:bg-primary transition-colors"></div>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="relative">
          {/* Linha decorativa superior */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary/50 rounded-full"></div>
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary/50 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 py-6 mb-6 border-t border-border/50">
            {footerConfig.security.map((item, index) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap]
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <IconComponent className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left border-t border-border/50 pt-6">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>
              © {footerConfig.company.year} {settings?.siteName}
            </span>
            <span className="text-border">•</span>
            <span>CNPJ: {footerConfig.company.cnpj}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-red-500 animate-pulse" />
            <span>no Brasil</span>
            <span className="text-border">•</span>
            <span className="text-orange-500 font-medium bg-orange-500/10 px-2 py-1 rounded-md">+18</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
