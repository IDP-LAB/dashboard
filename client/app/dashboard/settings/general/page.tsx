import { SelectItem } from "@/components/ui/select"
import { SelectContent } from "@/components/ui/select"
import { SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@/components/ui/select"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações Gerais</h2>
          <p className="text-muted-foreground">Ajustes gerais do sistema Maker Space Manager.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Configure opções como notificações, formato de data, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for general settings form fields */}
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Email para Notificações</Label>
            <Input id="notificationEmail" type="email" placeholder="admin@makerspace.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Formato de Data</Label>
            <Select defaultValue="dd/MM/yyyy">
              <SelectTrigger id="dateFormat">
                <SelectValue placeholder="Selecione formato de data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
