"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, UserPlus, Users, UserCheck, Shield, User, Eye, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"
import { InviteUserModal } from "@/components/users/invite-user-modal"
import { CreateUserModal } from "@/components/users/create-user-modal"
import { UserDetailsModal } from "@/components/users/user-details-modal"
import { EditUserModal } from "@/components/users/edit-user-modal"

// Tipos para usuários
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

// Dados mockados para demonstração
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    userType: "student",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    userType: "teacher",
    status: "active",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-19",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    userType: "student",
    status: "pending",
    createdAt: "2024-01-18",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    userType: "admin",
    status: "active",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-20",
  },
]

export default function UsersPage() {
  // Estados para controlar os modais
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)

  // Funções para gerenciar modais
  const openInviteModal = () => setIsInviteModalOpen(true)
  const openCreateModal = () => setIsCreateModalOpen(true)
  
  const openDetailsModal = (user: User) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const closeAllModals = () => {
    setIsInviteModalOpen(false)
    setIsCreateModalOpen(false)
    setIsDetailsModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  // Callbacks para os modais
  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser])
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
  }

  // Função para deletar usuário
  const handleDeleteUser = (userId: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      setUsers(users.filter(user => user.id !== userId))
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

  // Função para obter ícone do tipo de usuário
  const getUserTypeIcon = (userType: User["userType"]) => {
    switch (userType) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "teacher":
        return <User className="h-4 w-4" />
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

  // Definição das colunas da tabela
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "userType",
      header: "Tipo",
      cell: ({ row }) => {
        const userType = row.getValue("userType") as User["userType"]
        return (
          <div className="flex items-center gap-2">
            {getUserTypeIcon(userType)}
            <span>{getUserTypeLabel(userType)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as User["status"]
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return date.toLocaleDateString("pt-BR")
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Último acesso",
      cell: ({ row }) => {
        const lastLogin = row.getValue("lastLogin") as string | undefined
        if (!lastLogin) return <span className="text-muted-foreground">Nunca</span>
        const date = new Date(lastLogin)
        return date.toLocaleDateString("pt-BR")
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetailsModal(user)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditModal(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Opções de filtro para a tabela
  const filterOptions = [
    {
      key: "userType",
      label: "Tipo de usuário",
      options: [
        { label: "Aluno", value: "student" },
        { label: "Professor", value: "teacher" },
        { label: "Administrador", value: "admin" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Ativo", value: "active" },
        { label: "Inativo", value: "inactive" },
        { label: "Pendente", value: "pending" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, convites e permissões do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openInviteModal} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.userType === "teacher").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.userType === "student").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de usuários */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuários..."
        filterOptions={filterOptions}
        title="Lista de Usuários"
        description="Visualize e gerencie todos os usuários do sistema"
      />

      {/* Modais */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-2xl">
          <InviteUserModal onClose={closeAllModals} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <CreateUserModal 
            onClose={closeAllModals} 
            onUserCreated={(user) => {
              handleUserCreated(user)
              closeAllModals()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <UserDetailsModal 
              user={selectedUser} 
              onClose={closeAllModals} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <EditUserModal 
              user={selectedUser} 
              onClose={closeAllModals}
              onUserUpdated={(updatedUser) => {
                handleUserUpdated(updatedUser)
                closeAllModals()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}