"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export function BannerSlider() {
  const { settings } = useSettings()
  const [currentSlide, setCurrentSlide] = useState(0)

  const banners = settings?.banners?.filter((banner) => banner.active) || []

  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners.length) {
    return (
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-r from-primary to-secondary rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Bem-vindo ao {settings?.siteName}!</h2>
            <p className="text-lg opacity-90">A melhor plataforma de raspadinhas online</p>
          </div>
        </div>
      </div>
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden group">
      {/* Banners */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link href={banner.link} className="block w-full h-full">
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
            </Link>
          </div>
        ))}
      </div>

      {/* Controles */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
