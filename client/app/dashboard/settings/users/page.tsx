import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function UsersSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">Adicione, edite e gerencie permissões de usuários.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Usuários cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">Tabela de usuários e gerenciamento de roles aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
