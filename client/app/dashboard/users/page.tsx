"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateUserModal } from "@/components/users/create-user-modal"
import { EditUserModal } from "@/components/users/edit-user-modal"
import { InviteUserModal } from "@/components/users/invite-user-modal"
import { UserDetailsModal } from "@/components/users/user-details-modal"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { ColumnDef } from "@tanstack/react-table"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit, Eye, MoreHorizontal, Plus, Shield, Trash2, User, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo, useState } from "react"
import { Role, type User as ServerUser } from "server"

// Tipos para UI (mapeados do servidor)
interface UIUser {
  id: number
  name: string
  email: string
  username: string
  userType: "student" | "teacher" | "admin"
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin?: string
}

function mapRoleToUserType(role: Role): UIUser["userType"] {
  if (role === Role.Administrator) return "admin"
  if (role === Role.Teacher) return "teacher"
  return "student"
}

function mapServerUserToUI(user: ServerUser): UIUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    userType: mapRoleToUserType(user.role as Role),
    status: "active",
    createdAt: (user as any).createdAt ?? new Date().toISOString(),
    lastLogin: undefined,
  }
}

export default function UsersPage() {
  const { client } = useAPI()
  const queryClient = useQueryClient()

  // Estados para controlar os modais
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null)
  // Paginação servidor
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [roleFilter, setRoleFilter] = useState<"all" | "administrator" | "teacher" | "student">("all")

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["users", pageIndex, pageSize, roleFilter],
    queryFn: async () => {
      const query: Record<string, string | number> = { page: pageIndex + 1, pageSize }
      if (roleFilter !== "all") query.role = roleFilter
      const response = await client.query(`/users`, "get", { query })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    }
  })

  const users: UIUser[] = useMemo(() => ((data?.data as any)?.items ?? []).map(mapServerUserToUI), [data])
  const roleStats = (data?.data as any)?.roles as { administrator: number; teacher: number; student: number; total: number } | undefined

  // Funções para gerenciar modais
  const openInviteModal = () => setIsInviteModalOpen(true)
  const openCreateModal = () => setIsCreateModalOpen(true)
  
  const openDetailsModal = async (uiUser: UIUser) => {
    // Buscar dados atualizados do usuário
    const response = await client.query('/users/:id', 'get', { id: String(uiUser.id) })
    if (isSuccessResponse<ServerUser>(response)) {
      setSelectedUser(mapServerUserToUI(response.data as unknown as ServerUser))
    } else {
      setSelectedUser(uiUser)
    }
    setIsDetailsModalOpen(true)
  }

  const openEditModal = async (uiUser: UIUser) => {
    const response = await client.query('/users/:id', 'get', { id: String(uiUser.id) })
    if (isSuccessResponse<ServerUser>(response)) {
      setSelectedUser(mapServerUserToUI(response.data as unknown as ServerUser))
    } else {
      setSelectedUser(uiUser)
    }
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
  const handleUserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] })
  }

  const handleUserUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] })
  }

  // Função para deletar usuário
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await client.query('/users/:id', 'delete', { id: String(userId) })
      if (!isSuccessResponse(res)) throw new Error(res.message)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })
  const handleDeleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteMutation.mutate(userId)
    }
  }

  // Função para obter cor do status
  const getStatusColor = (status: UIUser["status"]) => {
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
  const getStatusLabel = (status: UIUser["status"]) => {
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
  const getUserTypeIcon = (userType: UIUser["userType"]) => {
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
  const getUserTypeLabel = (userType: UIUser["userType"]) => {
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
  const columns: ColumnDef<UIUser>[] = [
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
        const userType = row.getValue("userType") as UIUser["userType"]
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
        const status = row.getValue("status") as UIUser["status"]
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

  // Opções de filtro para a tabela (removido filtro de status)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.total ?? users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.teacher ?? users.filter(user => user.userType === "teacher").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats?.student ?? users.filter(user => user.userType === "student").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro por role + Tabela de usuários */}
      <div className="flex items-center justify-end mb-2">
        <Select value={roleFilter} onValueChange={(v: any) => { setRoleFilter(v); setPageIndex(0) }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="administrator">Administrador</SelectItem>
            <SelectItem value="teacher">Professor</SelectItem>
            <SelectItem value="student">Aluno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuários..."
        filterOptions={filterOptions}
        title="Lista de Usuários"
        description="Visualize e gerencie todos os usuários do sistema"
        isLoading={isFetching}
        onRefresh={refetch}
        serverPagination={{
          pageIndex,
          pageSize,
          total: (data?.metadata as any)?.total ?? users.length,
          totalPages: (data?.metadata as any)?.totalPages ?? 1,
          onPageChange: setPageIndex,
          onPageSizeChange: (size) => { setPageSize(size); setPageIndex(0) }
        }}
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
            onUserCreated={() => {
              handleUserCreated()
              closeAllModals()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <UserDetailsModal 
              user={selectedUser as any} 
              onClose={closeAllModals} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <EditUserModal 
              user={selectedUser as any} 
              onClose={closeAllModals}
              onUserUpdated={() => {
                handleUserUpdated()
                closeAllModals()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}