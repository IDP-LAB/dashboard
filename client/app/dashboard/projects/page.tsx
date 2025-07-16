"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectsTimelineChart } from "@/components/charts/projects-timeline-chart"
import { UserActivityChart } from "@/components/charts/user-activity-chart"
import { ProjectForm } from "@/components/projects/project-form"
import { AssociateItemsDialog } from "@/components/projects/associate-items-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, Target, MoreHorizontal, Edit, Link, Eye, Trash2 } from "lucide-react"
import { mockProjects } from "@/lib/data"
import type { Project, ProjectStatus } from "@/lib/types"

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogType, setDialogType] = useState<"form" | "associate" | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "planning":
        return "Planejamento"
      case "on_hold":
        return "Em Pausa"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleNewProject = () => {
    setSelectedProject(null)
    setDialogType("form")
    setIsDialogOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setDialogType("form")
    setIsDialogOpen(true)
  }

  const handleAssociateItems = (project: Project) => {
    setSelectedProject(project)
    setDialogType("associate")
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setDialogType(null)
    setSelectedProject(null)
  }

  const activeProjects = mockProjects.filter((p) => p.status === "active")
  const projectStats = {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === "active").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
    planning: mockProjects.filter((p) => p.status === "planning").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Projetos</h2>
          <p className="text-muted-foreground">Associe itens a projetos e acompanhe o uso de recursos.</p>
        </div>
        <Button onClick={handleNewProject}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      {/* Estatísticas dos Projetos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">Todos os projetos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.active}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Planejamento</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.planning}</div>
            <p className="text-xs text-muted-foreground">Sendo planejados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>Todos os projetos cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                <TableHead className="hidden lg:table-cell">Orçamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.leaderName}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{new Date(project.deadline).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="hidden md:table-cell">{project.associatedItems.length}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {project.budget ? `R$ ${project.budget.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("Ver detalhes", project.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssociateItems(project)}>
                          <Link className="mr-2 h-4 w-4" />
                          Associar Itens
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

      {/* Gráficos de Projetos */}
      <div className="grid gap-6 md:grid-cols-1">
        <ProjectsTimelineChart />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <UserActivityChart />
      </div>

      {/* Dialog para Formulários */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {dialogType === "form" && <ProjectForm project={selectedProject || undefined} onClose={handleCloseDialog} />}
          {dialogType === "associate" && selectedProject && (
            <AssociateItemsDialog project={selectedProject} onClose={handleCloseDialog} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
