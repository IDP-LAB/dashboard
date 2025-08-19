"use client"

import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Clock, Shield, Activity, UserCheck } from "lucide-react"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  name: string
  email: string
  userType: "student" | "teacher" | "admin"
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin?: string
  avatar?: string
}

interface UserDetailsModalProps {
  user: User
  onClose: () => void
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  // Função para obter cor do status
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Função para obter label do status
  const getStatusLabel = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "inactive":
        return "Inativo"
      case "pending":
        return "Pendente"
      default:
        return "Desconhecido"
    }
  }

  // Função para obter ícone do tipo de usuário
  const getUserTypeIcon = (userType: User["userType"]) => {
    switch (userType) {
      case "admin":
        return <Shield className="h-5 w-5" />
      case "teacher":
        return <UserCheck className="h-5 w-5" />
      case "student":
        return <User className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  // Função para obter label do tipo de usuário
  const getUserTypeLabel = (userType: User["userType"]) => {
    switch (userType) {
      case "admin":
        return "Administrador"
      case "teacher":
        return "Professor"
      case "student":
        return "Aluno"
      default:
        return "Desconhecido"
    }
  }

  // Função para obter descrição do tipo de usuário
  const getUserTypeDescription = (userType: User["userType"]) => {
    switch (userType) {
      case "admin":
        return "Acesso completo ao sistema, incluindo gerenciamento de usuários e configurações"
      case "teacher":
        return "Pode criar e gerenciar cursos, visualizar relatórios de alunos"
      case "student":
        return "Acesso aos cursos matriculados e materiais de estudo"
      default:
        return "Tipo de usuário não definido"
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Função para calcular tempo desde criação
  const getTimeSinceCreation = (dateString: string) => {
    const createdDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 dia"
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
    return `${Math.floor(diffDays / 365)} anos`
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Detalhes do Usuário
        </DialogTitle>
        <DialogDescription>
          Visualize todas as informações detalhadas do usuário selecionado.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {getUserTypeIcon(user.userType)}
              </div>
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Nome Completo
                </Label>
                <p className="text-sm font-medium">{user.name}</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              {/* ID do Usuário */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  ID do Usuário
                </Label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{user.id}</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  Status
                </Label>
                <Badge className={getStatusColor(user.status)}>
                  {getStatusLabel(user.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Usuário e Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {getUserTypeIcon(user.userType)}
              Tipo de Usuário e Permissões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tipo:</span>
                <Badge variant="outline" className="flex items-center gap-2">
                  {getUserTypeIcon(user.userType)}
                  {getUserTypeLabel(user.userType)}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Descrição das Permissões
                </Label>
                <p className="text-sm text-muted-foreground">
                  {getUserTypeDescription(user.userType)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Atividade no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de Criação */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Conta Criada
                </Label>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há {getTimeSinceCreation(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Último Login */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  Último Acesso
                </Label>
                <div className="space-y-1">
                  {user.lastLogin ? (
                    <>
                      <p className="text-sm font-medium">
                        {formatDate(user.lastLogin)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Há {getTimeSinceCreation(user.lastLogin)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nunca fez login</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </div>
  )
}