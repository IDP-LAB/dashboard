import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function CategoriesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Categorias</h2>
          <p className="text-muted-foreground">Crie e organize as categorias para os itens.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>Categorias disponíveis para classificar itens.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">Tabela de categorias aparecerá aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
