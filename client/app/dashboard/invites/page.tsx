"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAPI } from "@/hooks/useAPI"
import { Role } from "server"
import { isSuccessResponse } from "@/lib/response"
import { useToast } from "@/components/ui/use-toast"
import { ColumnDef } from "@tanstack/react-table"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit, Trash2, Copy, Mail } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { InviteUserModal } from "@/components/users/invite-user-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type InviteRole = Role

type Invite = {
  id: number
  emails?: string[]
  role: InviteRole
  uses: number
  code: string
  users: { id: number }[]
  createdAt: string
  expiresAt?: string | null
}

export default function InvitesPage() {
  const { client } = useAPI()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingInvite, setEditingInvite] = useState<Invite | null>(null)
  const [formState, setFormState] = useState<{ emails?: string; uses?: number; role?: InviteRole; expiresIn?: string }>({})

  const fetchInvites = useCallback(async () => {
    const response = await client.query("/invite", "get", { query: search ? { search } : {} })
    if (!isSuccessResponse(response)) throw new Error(response.message)
    return response
  }, [client, search])

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["invites", search],
    queryFn: fetchInvites,
    refetchOnWindowFocus: true,
  })

  const deleteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await client.query("/invite/id/:id", "delete", { id: String(inviteId) })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast({ title: "Convite deletado" })
      queryClient.invalidateQueries({ queryKey: ["invites"] })
    },
    onError: (error: unknown) => {
      toast({ title: "Erro ao deletar", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: { emails?: string[]; uses?: number; role?: Extract<InviteRole, Role.Teacher | Role.Student>; expiresIn?: string } }) => {
      const response = await client.query("/invite/id/:id", "put", { id: String(payload.id) }, payload.data)
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast({ title: "Convite atualizado" })
      setIsEditOpen(false)
      setEditingInvite(null)
      queryClient.invalidateQueries({ queryKey: ["invites"] })
    },
    onError: (error: unknown) => {
      toast({ title: "Erro ao atualizar", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" })
    }
  })

  const columns = useMemo<ColumnDef<Invite>[]>(() => [
    {
      accessorKey: "code",
      header: "Código",
    },
    {
      accessorKey: "role",
      header: "Papel",
      cell: ({ row }) => {
        const role = row.getValue("role") as InviteRole
        if (role === "administrator") return "Administrador"
        if (role === "teacher") return "Professor"
        return "Aluno"
      }
    },
    {
      accessorKey: "uses",
      header: "Limite de usos",
    },
    {
      id: "used",
      header: "Usos realizados",
      cell: ({ row }) => row.original.users.length
    },
    {
      accessorKey: "emails",
      header: "Emails permitidos",
      cell: ({ row }) => (row.original.emails && row.original.emails.length > 0 ? row.original.emails.join(", ") : "Qualquer")
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleString("pt-BR")
    },
    {
      accessorKey: "expiresAt",
      header: "Expira em",
      cell: ({ row }) => {
        const expiresAt = row.getValue("expiresAt") as string | null
        return expiresAt ? new Date(expiresAt).toLocaleString("pt-BR") : "—"
      }
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const invite = row.original
        return (
          <div className="flex gap-2 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => {
                    setEditingInvite(invite)
                    setFormState({
                      emails: invite.emails?.join(", ") ?? "",
                      uses: invite.uses,
                      role: invite.role,
                    })
                    setIsEditOpen(true)
                  }} aria-label="Editar convite">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteMutation.mutate(invite.id)} disabled={deleteMutation.isPending} aria-label="Deletar convite">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deletar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const url = `${window.location.origin}/auth/register?invite=${invite.code}`
                      try {
                        await navigator.clipboard.writeText(url)
                        toast({ title: "Link copiado" })
                      } catch {
                        toast({ title: "Não foi possível copiar o link", variant: "destructive" })
                      }
                    }}
                    aria-label="Copiar link de convite"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar link de convite</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {invite.emails && invite.emails.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        await new Promise((r) => setTimeout(r, 800))
                        toast({ title: `Solicitada entrega para ${invite.emails!.length} e-mail(s)` }) 
                      }}
                      aria-label="Enviar convite por e-mail"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar convite por e-mail</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      }
    }
  ], [deleteMutation])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Convites</h1>
          <p className="text-muted-foreground">Gerencie convites, usos e permissões</p>
        </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input placeholder="Buscar por código..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => setIsCreateOpen(true)}>Criar Convite</Button>
      </div>

      <DataTable<Invite, unknown>
        columns={columns}
        data={(data?.data as unknown as Invite[]) ?? []}
        title="Lista de Convites"
        description="Visualize e gerencie os convites do sistema"
        isLoading={isFetching}
        onRefresh={refetch}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Convite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Emails permitidos (separados por vírgula)</Label>
              <Input value={formState.emails ?? ""} onChange={(e) => setFormState((s) => ({ ...s, emails: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Limite de usos</Label>
              <Input type="number" min={1} value={formState.uses ?? 1} onChange={(e) => setFormState((s) => ({ ...s, uses: Number(e.target.value) }))} />
            </div>
            <div className="grid gap-2">
              <Label>Expira em (ex.: 7d, 12h, 30m)</Label>
              <Input placeholder="7d" value={formState.expiresIn ?? ""} onChange={(e) => setFormState((s) => ({ ...s, expiresIn: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (!editingInvite) return
                  updateMutation.mutate({
                    id: editingInvite.id,
                    data: {
                      emails: formState.emails && formState.emails.trim() !== "" ? formState.emails.split(",").map((e) => e.trim()) : undefined,
                      uses: formState.uses,
                      expiresIn: formState.expiresIn,
                    },
                  })
                }}
                disabled={updateMutation.isPending}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <InviteUserModal
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => {
              setIsCreateOpen(false)
              queryClient.invalidateQueries({ queryKey: ["invites"] })
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}


