"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, User, Mail, Lock, Users, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { useMutation } from "@tanstack/react-query"
import { Role } from "server"

interface CreateUserModalProps {
  onClose: () => void
  onUserCreated: () => void
}

interface CreateUserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: "student" | "teacher" | "admin" | ""
}

export function CreateUserModal({ onClose, onUserCreated }: CreateUserModalProps) {
  const { client } = useAPI()
  const [form, setForm] = useState<CreateUserForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<CreateUserForm>>({})

  const createMutation = useMutation({
    mutationFn: async () => {
      const username = form.email.includes('@') ? form.email.split('@')[0] : form.name.replace(/\s+/g, '').toLowerCase()
      const role: Role = form.userType === 'admin' ? Role.Administrator : form.userType === 'teacher' ? Role.Teacher : Role.Student
      const payload = {
        name: form.name.trim(),
        username,
        email: form.email.trim().toLowerCase(),
        language: 'pt-BR',
        password: form.password,
        role,
      }
      const response = await client.query('/users', 'post', payload)
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!')
      onUserCreated()
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário')
    }
  })

  // Função para atualizar campos do formulário
  const updateForm = (field: keyof CreateUserForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserForm> = {}

    // Validar nome
    if (!form.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    // Validar email
    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido"
    }

    // Validar senha
    if (!form.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (form.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    // Validar confirmação de senha
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem"
    }

    // Validar tipo de usuário
    if (!form.userType) {
      newErrors.userType = ""
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Função para criar usuário
  const handleCreateUser = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário")
      return
    }

    setIsLoading(true)
    try {
      await createMutation.mutateAsync()
    } finally {
      setIsLoading(false)
    }
  }

  // Função para gerar senha aleatória
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    updateForm("password", password)
    updateForm("confirmPassword", password)
    toast.success("Senha gerada automaticamente")
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Novo Usuário
        </DialogTitle>
        <DialogDescription>
          Crie um novo usuário manualmente no sistema. Todos os campos são obrigatórios.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Campo de Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome Completo
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          </Label>
          <Input
            id="name"
            placeholder="Digite o nome completo"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Campo de Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Campo de Tipo de Usuário */}
        <div className="space-y-2">
          <Label htmlFor="userType" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tipo de Usuário
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          </Label>
          <Select value={form.userType} onValueChange={(value) => updateForm("userType", value)}>
            <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Aluno</SelectItem>
              <SelectItem value="teacher">Professor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
          {errors.userType && (
            <p className="text-xs text-red-500">{errors.userType}</p>
          )}
        </div>

        {/* Campo de Senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Senha
              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateRandomPassword}
              className="h-auto p-1 text-xs"
            >
              Gerar Senha
            </Button>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite a senha (mín. 6 caracteres)"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              className={errors.password ? "border-red-500 pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Campo de Confirmação de Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Confirmar Senha
            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a senha"
              value={form.confirmPassword}
              onChange={(e) => updateForm("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleCreateUser} disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar Usuário"}
        </Button>
      </DialogFooter>
    </div>
  )
}