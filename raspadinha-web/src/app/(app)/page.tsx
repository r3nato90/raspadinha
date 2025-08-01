import { Container } from "@/components/container"
import { BannerSlider } from "@/components/banner-slider"
import { LiveWinsSlider } from "@/components/live-wins-slider"
import { ScratchCardsSection } from "@/components/scratch-cards-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Banner */}
      <section className="py-8 md:py-12">
        <Container>
          {/* Banner Slider */}
          <BannerSlider />

          {/* Live Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Live Title */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
                  🔴 AO VIVO
                </h2>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full" />
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Veja em tempo real os jogadores ganhando prêmios incríveis!
                <span className="text-primary font-semibold"> Você pode ser o próximo! 🎯</span>
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <div className="text-2xl font-bold text-primary">R$ 45.280</div>
                  <div className="text-sm text-muted-foreground">Pagos hoje</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <div className="text-2xl font-bold text-primary">1.247</div>
                  <div className="text-sm text-muted-foreground">Jogadores online</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors col-span-2 md:col-span-1">
                  <div className="text-2xl font-bold text-primary">98.5%</div>
                  <div className="text-sm text-muted-foreground">Taxa de pagamento</div>
                </div>
              </div>
            </div>

            {/* Live Wins Slider */}
            <div className="lg:col-span-1">
              <LiveWinsSlider />
            </div>
          </div>
        </Container>
      </section>

      {/* Scratch Cards Section */}
      <section className="py-8">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">🎰 Escolha sua Raspadinha</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Centenas de raspadinhas com prêmios reais. Ganhe dinheiro, produtos e muito mais!
            </p>
          </div>
          <ScratchCardsSection />
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">100% Seguro</h3>
              <p className="text-muted-foreground">
                Plataforma regulamentada com SSL, criptografia avançada e pagamentos seguros via PIX.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Pagamento Instantâneo</h3>
              <p className="text-muted-foreground">
                Ganhou? Receba na hora! PIX automático em até 5 minutos após a vitória.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Prêmios Incríveis</h3>
              <p className="text-muted-foreground">
                Dinheiro real, produtos eletrônicos, viagens e muito mais. Diversão garantida!
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
