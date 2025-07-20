"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MaintenanceChart } from "@/components/charts/maintenance-chart"
import { EquipmentStatusChart } from "@/components/charts/equipment-status-chart"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, History, Calendar, Wrench, MoreHorizontal, Edit, Eye, Trash2, AlertTriangle } from "lucide-react"
import { mockMaintenances } from "@/lib/data"
import type { Maintenance, MaintenanceStatus, MaintenanceType } from "@/lib/types"

export default function MaintenancePage() {
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: MaintenanceStatus) => {
    switch (status) {
      case "scheduled":
        return "Agendada"
      case "in_progress":
        return "Em Andamento"
      case "completed":
        return "Concluída"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const getTypeColor = (type: MaintenanceType) => {
    return type === "preventive"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  }

  const getTypeLabel = (type: MaintenanceType) => {
    return type === "preventive" ? "Preventiva" : "Corretiva"
  }

  const handleNewMaintenance = () => {
    setSelectedMaintenance(null)
    setIsDialogOpen(true)
  }

  const handleEditMaintenance = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedMaintenance(null)
  }

  const upcomingMaintenances = mockMaintenances.filter(
    (m) => m.status === "scheduled" && new Date(m.scheduledDate) >= new Date(),
  )

  const overdueMaintenances = mockMaintenances.filter(
    (m) => m.status === "scheduled" && new Date(m.scheduledDate) < new Date(),
  )

  const maintenanceStats = {
    total: mockMaintenances.length,
    scheduled: mockMaintenances.filter((m) => m.status === "scheduled").length,
    inProgress: mockMaintenances.filter((m) => m.status === "in_progress").length,
    completed: mockMaintenances.filter((m) => m.status === "completed").length,
    overdue: overdueMaintenances.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Manutenção</h2>
          <p className="text-muted-foreground">Registre e acompanhe manutenções preventivas e corretivas.</p>
        </div>
        <div className="space-x-2">
          <Button onClick={handleNewMaintenance}>
            <PlusCircle className="mr-2 h-4 w-4" /> Agendar Manutenção
          </Button>
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" /> Histórico Completo
          </Button>
        </div>
      </div>

      {/* Estatísticas de Manutenção */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.total}</div>
            <p className="text-xs text-muted-foreground">Todas as manutenções</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Sendo executadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Wrench className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.overdue}</div>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Manutenções Atrasadas */}
      {overdueMaintenances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Manutenções Atrasadas ({overdueMaintenances.length})
            </CardTitle>
            <CardDescription>Manutenções que passaram da data programada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueMaintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">{maintenance.equipmentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(maintenance.type)} - Agendada para{" "}
                        {new Date(maintenance.scheduledDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Atrasada</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Manutenções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Próximas Manutenções ({upcomingMaintenances.length})
          </CardTitle>
          <CardDescription>Manutenções programadas para os próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingMaintenances.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma manutenção programada.</p>
          ) : (
            <div className="space-y-3">
              {upcomingMaintenances.slice(0, 5).map((maintenance) => (
                <div key={maintenance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{maintenance.equipmentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(maintenance.type)} -{" "}
                        {new Date(maintenance.scheduledDate).toLocaleDateString("pt-BR")}
                        {maintenance.technician && ` - ${maintenance.technician}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(maintenance.type)}>{getTypeLabel(maintenance.type)}</Badge>
                    <Badge className={getStatusColor(maintenance.status)}>{getStatusLabel(maintenance.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista Completa de Manutenções */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Manutenções</CardTitle>
          <CardDescription>Todas as manutenções registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Agendada</TableHead>
                <TableHead className="hidden md:table-cell">Técnico</TableHead>
                <TableHead className="hidden lg:table-cell">Custo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMaintenances.map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell className="font-medium">{maintenance.equipmentName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(maintenance.type)}>{getTypeLabel(maintenance.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(maintenance.status)}>{getStatusLabel(maintenance.status)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(maintenance.scheduledDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="hidden md:table-cell">{maintenance.technician || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {maintenance.cost ? `R$ ${maintenance.cost.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("Ver detalhes", maintenance.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMaintenance(maintenance)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gráficos de Manutenção */}
      <div className="grid gap-6 md:grid-cols-2">
        <MaintenanceChart />
        <EquipmentStatusChart />
      </div>

      {/* Dialog para Formulário de Manutenção */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <MaintenanceForm maintenance={selectedMaintenance || undefined} onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
