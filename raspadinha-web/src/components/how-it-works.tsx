import { UserPlus, Gamepad2, MousePointer, Gift } from "lucide-react"

const steps = [
  {
    id: 1,
    icon: UserPlus,
    title: "Crie sua Conta",
    description: "Cadastre-se rapidamente e faça seu primeiro depósito para começar a jogar",
  },
  {
    id: 2,
    icon: Gamepad2,
    title: "Selecione uma Raspadinha",
    description: "Escolha entre diversas opções de raspadinhas com prêmios incríveis",
  },
  {
    id: 3,
    icon: MousePointer,
    title: "Raspe e Descubra",
    description: "Use o dedo ou mouse para raspar e descobrir se você ganhou",
  },
  {
    id: 4,
    icon: Gift,
    title: "Receba seu Prêmio",
    description: "Ganhou? Receba seu prêmio instantaneamente via PIX ou retire produtos",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como Funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra como é fácil jogar e ganhar prêmios incríveis em nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                <div className="relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg z-10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {step.id}
                        </span>
                        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
