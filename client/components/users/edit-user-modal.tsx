"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, UserCheck, Save, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { useMutation } from "@tanstack/react-query"

interface User {
  id: number
  name: string
  email: string
  userType: "student" | "teacher" | "admin"
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin?: string
}

interface EditUserModalProps {
  user: User
  onClose: () => void
  onUserUpdated: (updatedUser: User) => void
}

export function EditUserModal({ user, onClose, onUserUpdated }: EditUserModalProps) {
  const { client } = useAPI()
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    userType: user.userType,
    status: user.status
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = { name: formData.name }
      // username no backend é editável, mas mantemos email separado
      payload.username = formData.email.split('@')[0]
      const response = await client.query('/users/:id', 'put', { id: String(user.id) }, payload)
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!')
      onUserUpdated({ ...user, name: formData.name, email: formData.email, userType: formData.userType, status: formData.status })
      onClose()
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
    }
  })

  // Função para validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido"
    }

    if (!formData.userType) {
      newErrors.userType = "Tipo de usuário é obrigatório"
    }

    if (!formData.status) {
      newErrors.status = "Status é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Função para salvar alterações
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário")
      return
    }

    setIsLoading(true)
    
    try {
      await updateMutation.mutateAsync()
    } catch (error) {
      toast.error("Erro ao atualizar usuário. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para obter ícone do tipo de usuário
  const getUserTypeIcon = (userType: User["userType"]) => {
    switch (userType) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "teacher":
        return <UserCheck className="h-4 w-4" />
      case "student":
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
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

  // Verificar se houve mudanças
  const hasChanges = (
    formData.name !== user.name ||
    formData.email !== user.email ||
    formData.userType !== user.userType ||
    formData.status !== user.status
  )

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Editar Usuário
        </DialogTitle>
        <DialogDescription>
          Modifique as informações do usuário. Campos marcados com * são obrigatórios.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações Atuais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações Atuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>ID:</span>
              <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{String(user.id)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Criado em:</span>
              <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            {user.lastLogin && (
              <div className="flex items-center justify-between text-sm">
                <span>Último acesso:</span>
                <span>{new Date(user.lastLogin).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Formulário de Edição */}
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: "" }))
                }
              }}
              placeholder="Digite o nome completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }))
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: "" }))
                }
              }}
              placeholder="Digite o email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {getUserTypeIcon(formData.userType)}
              Tipo de Usuário *
            </Label>
            <Select
              value={formData.userType}
              onValueChange={(value: User["userType"]) => {
                setFormData(prev => ({ ...prev, userType: value }))
                if (errors.userType) {
                  setErrors(prev => ({ ...prev, userType: "" }))
                }
              }}
            >
              <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Aluno
                  </div>
                </SelectItem>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Professor
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Administrador
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.userType}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Status *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: User["status"]) => {
                setFormData(prev => ({ ...prev, status: value }))
                if (errors.status) {
                  setErrors(prev => ({ ...prev, status: "" }))
                }
              }}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <Badge className={getStatusColor("active")}>
                    {getStatusLabel("active")}
                  </Badge>
                </SelectItem>
                <SelectItem value="inactive">
                  <Badge className={getStatusColor("inactive")}>
                    {getStatusLabel("inactive")}
                  </Badge>
                </SelectItem>
                <SelectItem value="pending">
                  <Badge className={getStatusColor("pending")}>
                    {getStatusLabel("pending")}
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.status}
              </p>
            )}
          </div>
        </div>

        {/* Preview das Mudanças */}
        {hasChanges && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Resumo das Alterações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {formData.name !== user.name && (
                <div className="flex justify-between">
                  <span>Nome:</span>
                  <span className="font-medium">{user.name} → {formData.name}</span>
                </div>
              )}
              {formData.email !== user.email && (
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{user.email} → {formData.email}</span>
                </div>
              )}
              {formData.userType !== user.userType && (
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="font-medium">
                    {getUserTypeLabel(user.userType)} → {getUserTypeLabel(formData.userType)}
                  </span>
                </div>
              )}
              {formData.status !== user.status && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">
                    {getStatusLabel(user.status)} → {getStatusLabel(formData.status)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </DialogFooter>
    </div>
  )
}