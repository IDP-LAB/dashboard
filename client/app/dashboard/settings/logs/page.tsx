"use client"

import { UserCell } from "@/components/logs/UserCell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import Link from "next/link"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  Calendar,
  Copy as CopyIcon,
  ExternalLink,
  FileText,
  Filter,
  Loader2
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { User as UserType } from "server"
import { Log } from "server/src/database"

type LogData = {
  value: string
  label: string
}

// Tipos de eventos disponíveis
const LOG_TYPES: LogData[] = [
  { value: 'item:created', label: 'Item Criado' },
  { value: 'item:updated', label: 'Item Atualizado' },
  { value: 'item:deleted', label: 'Item Deletado' },
  { value: 'project:created', label: 'Projeto Criado' },
  { value: 'project:updated', label: 'Projeto Atualizado' },
  { value: 'project:deleted', label: 'Projeto Deletado' },
  { value: 'invite:created', label: 'Convite Criado' },
  { value: 'invite:claimed', label: 'Convite Utilizado' },
  { value: 'group:deleted', label: 'Grupo Deletado' },
  { value: 'user:login', label: 'Login de Usuário' },
  { value: 'user:created', label: 'Usuário Criado' },
  { value: 'user:updated', label: 'Usuário Atualizado' },
  { value: 'user:deleted', label: 'Usuário Deletado' },
]

// A paginação será feita no DataTable; carregamos um lote grande do servidor

export default function LogsPage() {
  const { client } = useAPI()

  // Estados para filtros
  const [selectedLogType, setSelectedLogType] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; username: string } | null>(null)
  const [userSearch, setUserSearch] = useState<string>('')
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  // Paginação do servidor
  const [pageIndex, setPageIndex] = useState<number>(0) // zero-based
  const [pageSize, setPageSize] = useState<number>(10)

  // Busca de usuários conforme digita
  const { data: usersSearchData } = useQuery({
    queryKey: ["users", userSearch],
    queryFn: async () => {
      const query = {
        page: 1,
        pageSize: 10,
        ...(userSearch.trim() ? { q: userSearch.trim() } : {})
      }
      const response = await client.query(`/users`, 'get', { query })
      if (!isSuccessResponse(response)) {
        return { data: { items: [], roles: { administrator: 0, teacher: 0, student: 0, total: 0 } } }
      }
      return response
    },
    enabled: userPopoverOpen,
    staleTime: 30000,
  })

  // Query para buscar logs com paginação do servidor
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["logs", selectedLogType, selectedUser?.id ?? null, startDate, endDate, pageIndex, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(pageIndex + 1),
        pageSize: String(pageSize),
      })

      if (selectedLogType && selectedLogType !== 'all') {
        params.append("code", selectedLogType)
      }

      if (selectedUser?.id) {
        params.append("userId", String(selectedUser.id))
      }

      if (startDate) params.append('start', startDate)
      if (endDate) params.append('end', endDate)

      const response = await client.query(
        `/logs?${params.toString()}` as '/logs',
        "get",
        undefined
      )

      if (!isSuccessResponse(response)) {
        throw new Error(response.message)
      }

      return response
    },
    staleTime: 30000
  })

  // Resetar para primeira página ao mudar filtros
  useEffect(() => {
    setPageIndex(0)
  }, [selectedLogType, selectedUser?.id, startDate, endDate])

  // Função para formatar dados do log
  const formatLogData = (logData: any, code: string) => {
    if (!logData) return 'N/A'
    
    try {
      switch (code) {
        case 'item:created':
        case 'item:updated':
          return `ID: ${logData.id}${logData.name ? ` • Nome: ${logData.name}` : ''}`
        case 'project:created':
        case 'project:updated':
          return `ID: ${logData.id}${logData.name ? ` • Nome: ${logData.name}` : ''}`
        case 'user:login':
        case 'user:created':
        case 'user:updated':
          return `ID: ${logData.id}${logData.name ? ` • Nome: ${logData.name}` : ''}${logData.username ? ` • Usuário: @${logData.username}` : ''}`
        
        case 'item:deleted':
          return `Nome: ${logData.name}, Grupo: ${logData.group}, Owner: ${logData.ownerId}`
        
        case 'project:deleted':
          return `Nome: ${logData.name}, Owner: ${logData.ownerId}`

        case 'user:deleted':
          return `ID: ${logData.id}${logData.name ? ` • Nome: ${logData.name}` : ''}`

        case 'group:deleted':
          return `Grupo: ${logData.id}${logData.name ? ` • Nome: ${logData.name}` : ''} • Itens: ${logData.deletedItems} • Arquivos: ${logData.deletedFiles}`
        
        case 'invite:created':
          return `Convite #${logData.id} • Código: ${logData.code}`
        case 'invite:claimed':
          return `Usuário ID: ${logData.userId} • Código: ${logData.inviteCode}`
        
        default:
          return JSON.stringify(logData)
      }
    } catch {
      return 'Dados inválidos'
    }
  }

  // Função para obter a cor do badge baseada no tipo de evento
  const getEventBadgeVariant = (code: string) => {
    if (code.includes('created')) return 'default'
    if (code.includes('updated')) return 'secondary'
    if (code.includes('deleted')) return 'destructive'
    return 'outline'
  }

  // Definição das colunas da tabela
  const columns: ColumnDef<Log>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "code",
      header: "Evento",
      cell: ({ row }) => {
        const code = row.getValue("code") as string
        const logType = LOG_TYPES.find(type => type.value === code)
        return (
          <Badge variant={getEventBadgeVariant(code)}>
            {logType?.label || code}
          </Badge>
        )
      },
    },
    {
      accessorKey: "user",
      header: "Usuário",
      cell: ({ row }) => <UserCell row={row} />
    },
    {
      accessorKey: "data",
      header: "Dados",
      cell: ({ row }) => {
        const data = row.getValue("data")
        const code = row.getValue("code") as string
        return (
          <div className="max-w-xs">
            <span className="text-sm text-muted-foreground">
              {formatLogData(data, code)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data/Hora",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm">{format(date, "dd/MM/yyyy", { locale: ptBR })}</div>
              <div className="text-xs text-muted-foreground">
                {format(date, "HH:mm:ss", { locale: ptBR })}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const code = row.getValue("code") as string
        const data: any = row.getValue("data")
        const actions: React.ReactNode[] = []

        // Ação: Ir para item
        if (code.startsWith('item:') && data?.id) {
          actions.push(
            <Link key="item-link" href={`/dashboard/items/${data.id}`} className="inline-flex items-center text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Item
            </Link>
          )
        }

        // Ação: Ir para projetos (se houver id)
        if (code.startsWith('project:')) {
          actions.push(
            <Link key="project-link" href={`/dashboard/projects`} className="inline-flex items-center text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Projetos
            </Link>
          )
        }

        // Ação: Usuários para eventos de usuário
        if (code.startsWith('user:')) {
          actions.push(
            <Link key="users-page" href={`/dashboard/users`} className="inline-flex items-center text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Usuários
            </Link>
          )
        }

        // Ação: Convite - copiar código
        if (code === 'invite:created' && data?.code) {
          actions.push(
            <button
              key="copy-code"
              type="button"
              className="inline-flex items-center text-blue-600 hover:underline"
              onClick={() => navigator.clipboard.writeText(String(data.code))}
              aria-label="Copiar código do convite"
            >
              <CopyIcon className="h-4 w-4 mr-1" />
              Copiar Código
            </button>
          )
        }

        // Ação: Usuários (convite usado)
        if (code === 'invite:claimed') {
          actions.push(
            <Link key="users-link" href={`/dashboard/users`} className="inline-flex items-center text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Usuários
            </Link>
          )
        }

        if (actions.length === 0) return <span className="text-muted-foreground">—</span>
        return <div className="flex gap-2 flex-wrap">{actions}</div>
      }
    }
  ], [])

  const handleRefresh = () => {
    refetch()
  }

  const handleClearFilters = () => {
    setSelectedLogType('all')
    setSelectedUser(null)
    setUserSearch('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs do Sistema</h2>
          <p className="text-muted-foreground">
            Visualize e monitore eventos do sistema com filtros personalizados
          </p>
        </div>
      </div>

      {/* Card de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre os logs por tipo de evento ou usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por tipo de evento */}
            <div>
              <Label htmlFor="log-type">Tipo de Evento</Label>
              <Select value={selectedLogType} onValueChange={setSelectedLogType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  <Separator className="my-1" />
                  {LOG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por usuário (busca assíncrona) */}
            <div>
              <Label>Usuário</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedUser ? `${selectedUser.name} (@${selectedUser.username})` : 'Selecione um usuário'}
                    <span className="opacity-50">⌄</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Digite para buscar usuário..."
                      value={userSearch}
                      onValueChange={setUserSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      <CommandGroup>
                        {(usersSearchData?.data?.items || []).map((u: any) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.name} ${u.username}`}
                            onSelect={() => {
                              setSelectedUser({ id: u.id, name: u.name, username: u.username })
                              setUserPopoverOpen(false)
                            }}
                          >
                            {u.name} (@{u.username})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Intervalo de datas */}
            <div>
              <Label>Início</Label>
              <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <Label>Fim</Label>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {/* Botão para limpar filtros */}
            <div className="flex items-end md:col-span-4">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card da Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Registros de Log
              </CardTitle>
              <CardDescription>
                {data?.metadata?.total || 0} evento(s) no total
                {selectedLogType && selectedLogType !== 'all' && ` • Filtrado por: ${LOG_TYPES.find(t => t.value === selectedLogType)?.label}`}
                {selectedUser && ` • Usuário: ${selectedUser.name} (@${selectedUser.username})`}
                {startDate && ` • Início: ${format(new Date(startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}`}
                {endDate && ` • Fim: ${format(new Date(endDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}`}
              </CardDescription>
            </div>
            {isFetching && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Erro ao carregar logs: {(error as Error).message}</p>
              </div>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum log encontrado</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              searchPlaceholder="Buscar logs..."
              isLoading={isLoading}
              onRefresh={handleRefresh}
              serverPagination={{
                pageIndex,
                pageSize,
                total: data?.metadata?.total ?? 0,
                totalPages: data?.metadata?.totalPages ?? 1,
                onPageChange: setPageIndex,
                onPageSizeChange: (size) => {
                  setPageSize(size)
                  setPageIndex(0)
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
