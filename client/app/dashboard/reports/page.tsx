import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EquipmentUsageChart } from "@/components/charts/equipment-usage-chart"
import { MaterialConsumptionChart } from "@/components/charts/material-consumption-chart"
import { MaintenanceChart } from "@/components/charts/maintenance-chart"
import { CategoryDistributionChart } from "@/components/charts/category-distribution-chart"
import { StockLevelsChart } from "@/components/charts/stock-levels-chart"
import { ProjectsTimelineChart } from "@/components/charts/projects-timeline-chart"
import { UserActivityChart } from "@/components/charts/user-activity-chart"
import { CostAnalysisChart } from "@/components/charts/cost-analysis-chart"
import { Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios e Estatísticas</h2>
          <p className="text-muted-foreground">Análise completa de dados do Maker Space</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Seção: Uso de Equipamentos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Uso de Equipamentos</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <EquipmentUsageChart />
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Seção: Estoque e Materiais */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Estoque e Materiais</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <MaterialConsumptionChart />
          <StockLevelsChart />
        </div>
      </div>

      {/* Seção: Manutenção */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Manutenção</h3>
        <MaintenanceChart />
      </div>

      {/* Seção: Projetos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Projetos</h3>
        <ProjectsTimelineChart />
      </div>

      {/* Seção: Usuários e Custos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usuários e Custos</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <UserActivityChart />
          <CostAnalysisChart />
        </div>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
          <CardDescription>Principais insights dos dados coletados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600">✓ Pontos Positivos</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Alto uso de equipamentos de impressão 3D</li>
                <li>• Manutenções preventivas em dia</li>
                <li>• Projetos ativos crescendo 20%</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-amber-600">⚠ Atenção</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Estoque baixo de parafusos M3</li>
                <li>• Aumento de manutenções corretivas</li>
                <li>• Uso desigual entre usuários</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600">📈 Recomendações</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Reabastecer estoque crítico</li>
                <li>• Revisar cronograma de manutenção</li>
                <li>• Promover treinamentos para novos usuários</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
