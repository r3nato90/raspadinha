"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Edit, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/services/apiClient"
import { useSettings } from "@/contexts/settings-context"

interface Banner {
  id: string
  title: string
  image: string
  link: string
  active: boolean
  order: number
}

interface SiteSettings {
  siteName: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
}

export default function AdminSettings() {
  const { settings, refreshSettings } = useSettings()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "",
    logo: "",
    favicon: "",
    primaryColor: "#ffffff",
    secondaryColor: "#ffffff",
  })
  const [banners, setBanners] = useState<Banner[]>([])
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [newBanner, setNewBanner] = useState({
    title: "",
    image: "",
    link: "",
    active: true,
  })

  useEffect(() => {
    if (settings) {
      setSiteSettings({
        siteName: settings.siteName,
        logo: settings.logo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
      })
      setBanners(settings.banners || [])
    }
  }, [settings])

  const handleSaveSiteSettings = async () => {
    setLoading(true)
    try {
      await apiClient.put("/admin/settings", siteSettings)
      await refreshSettings()
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.image) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e imagem do banner",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.post("/admin/banners", newBanner)
      await refreshSettings()
      setNewBanner({ title: "", image: "", link: "", active: true })
      toast({
        title: "Banner criado",
        description: "Banner adicionado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao criar banner",
        description: "Não foi possível criar o banner",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBanner = async (banner: Banner) => {
    try {
      await apiClient.put(`/admin/banners/${banner.id}`, banner)
      await refreshSettings()
      setEditingBanner(null)
      toast({
        title: "Banner atualizado",
        description: "Banner editado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o banner",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return

    try {
      await apiClient.delete(`/admin/banners/${bannerId}`)
      await refreshSettings()
      toast({
        title: "Banner excluído",
        description: "Banner removido com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o banner",
        variant: "destructive",
      })
    }
  }

  const toggleBannerStatus = async (banner: Banner) => {
    const updatedBanner = { ...banner, active: !banner.active }
    await handleUpdateBanner(updatedBanner)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da plataforma</p>
      </div>

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome da Plataforma</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    placeholder="Nome da plataforma"
                  />
                </div>

                <div className="space-y-2">
                <Label htmlFor="logo">URL da Logo</Label>
                <Input
                    id="logo"
                    value={siteSettings.logo}
                    onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
                    placeholder="https://exemplo.com/logo.png"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="logo">URL do Favicon</Label>
                <Input
                    id="favicon"
                    value={siteSettings.favicon}
                    onChange={(e) => setSiteSettings({ ...siteSettings, favicon: e.target.value })}
                    placeholder="https://exemplo.com/favicon.ico"
                />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={siteSettings.primaryColor}
                      onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={siteSettings.primaryColor}
                      onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={siteSettings.secondaryColor}
                      onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={siteSettings.secondaryColor}
                      onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSiteSettings} disabled={loading} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <div className="space-y-6">
            {/* Criar Novo Banner */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Banner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Título do banner"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  />
                  <Input
                    placeholder="URL da imagem"
                    value={newBanner.image}
                    onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                  />
                  <Input
                    placeholder="Link de destino"
                    value={newBanner.link}
                    onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  />
                  <Button onClick={handleCreateBanner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Banners */}
            <div className="grid gap-4">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardContent className="p-4">
                    {editingBanner?.id === banner.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            placeholder="Título"
                            value={editingBanner.title}
                            onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                          />
                          <Input
                            placeholder="URL da imagem"
                            value={editingBanner.image}
                            onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                          />
                          <Input
                            placeholder="Link"
                            value={editingBanner.link}
                            onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateBanner(editingBanner)} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button onClick={() => setEditingBanner(null)} variant="outline" size="sm">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={banner.image || "/placeholder.svg"}
                            alt={banner.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium">{banner.title}</h3>
                            <p className="text-sm text-muted-foreground">{banner.link}</p>
                          </div>
                          <Badge variant={banner.active ? "default" : "secondary"}>
                            {banner.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={banner.active} onCheckedChange={() => toggleBannerStatus(banner)} />
                          <Button onClick={() => setEditingBanner(banner)} variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteBanner(banner.id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
