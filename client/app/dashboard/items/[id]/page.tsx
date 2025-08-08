"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  AlertTriangle,
  Plus,
  Eye
} from "lucide-react"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { ItemStatus, ItemType } from "server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ItemForm } from "@/components/item-form"
// import { GroupManager } from "@/components/group/group-manager"

export default function ItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { client } = useAPI()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isAddQuantityDialogOpen, setIsAddQuantityDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false)
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1)

  const itemId = Number(params.id)

  // Query para buscar detalhes do item (individual)
  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", itemId],
          queryFn: async () => {
        const response = await client.query("/item/:id", "get", { id: itemId }, undefined)
        if (!isSuccessResponse(response)) throw new Error(response.message)
        return response.data
    },
    enabled: !!itemId
  })

  // Query para buscar todos os itens do grupo usando o group?.id
  const { data: groupItems, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["item-group", item?.group?.id],
    queryFn: async () => {
      if (!item?.group?.id) throw new Error("Group  Uuid não encontrado")
      const response = await client.query("/group/:groupUuid" , "get", { groupUuid: item.group.id }, undefined)
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response.data
    },
    enabled: !!item?.group?.id
  })



  // Mutação para deletar item
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      const response = await client.query("/item/:id", "delete", { id: itemId }, { returnProducts: false })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: (response) => {
      const deletedFiles = response.data?.deletedFiles || 0
      toast({
        title: "Item deletado",
        description: `Item e ${deletedFiles} arquivo(s) removidos com sucesso.`,
      })
      // Redirecionar para a página de Gerenciar Grupo do item
      if (item?.group?.id) {
        router.push(`/dashboard/group/${item.group.id}`)
      } else {
        router.push("/dashboard/items")
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })



  // Mutação para adicionar quantidade (agora usando rota de grupo)
  const addQuantityMutation = useMutation({
    mutationFn: async (quantity: number) => {
      if (!item?.group?.id) throw new Error("group?.id não encontrado")
      const response = await client.query("/group/:groupUuid/add-quantity", "post", { groupUuid: item.group.id }, { quantity })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: (response) => {
      const addedCount = (response.data )?.addedQuantity || 0
      toast({
        title: "Quantidade adicionada",
        description: `${addedCount} item(s) adicionado(s) ao grupo com sucesso.`,
      })
      setIsAddQuantityDialogOpen(false)
      setQuantityToAdd(1)
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["item-group", item?.group?.id] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const handleEdit = () => setIsEditDialogOpen(true)

  const handleDelete = () => {
    deleteItemMutation.mutate()
  }



  const handleAddQuantity = () => {
    if (quantityToAdd > 0) {
      addQuantityMutation.mutate(quantityToAdd)
    }
  }

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.Available: return "default"
      case ItemStatus.InUse: return "secondary"
      case ItemStatus.Maintenance: return "destructive"
      case ItemStatus.Consumed: return "outline"
      default: return "default"
    }
  }

  const getTypeBadgeVariant = (type: ItemType) => {
    switch (type) {
      case ItemType.Equipment: return "default"
      case ItemType.Consumable: return "secondary"
      default: return "default"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função para formatar data com segurança (aceita string ou Date)
  const formatSafeDate = (dateInput: string | Date | undefined, formatString: string) => {
    if (!dateInput) return 'Data não disponível'

    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return format(date, formatString, { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Erro na formatação da data'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Item não encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">Detalhes do item</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push(`/dashboard/group/${item.group?.id}`)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
            <Eye className="mr-2 h-4 w-4" />
            Ver Grupo
          </Button>
          {item.group?.id && (
            <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Grupo</DialogTitle>
                  <DialogDescription>As alterações serão aplicadas a todos os itens do grupo</DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto">
                  <ItemForm
                    item={item as any}
                    isGroupEdit
                    hideQuantity
                    hideMediaSection
                    groupUuid={item.group.id}
                    hideHeader
                    hideName
                    hideType
                    hideCategory
                    hideDescription
                    hideConsumableDetails
                    onSuccess={() => {
                      setIsEditGroupDialogOpen(false)
                      queryClient.invalidateQueries({ queryKey: ["item", itemId] })
                      queryClient.invalidateQueries({ queryKey: ["item-group", item.group?.id] })
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isAddQuantityDialogOpen} onOpenChange={setIsAddQuantityDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Quantidade</DialogTitle>
                <DialogDescription>
                  Adicione mais itens ao grupo "{item.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantidade a adicionar</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddQuantityDialogOpen(false)}
                    disabled={addQuantityMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddQuantity}
                    disabled={addQuantityMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {addQuantityMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleEdit} className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300" variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Item
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar item?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O item #{item.id} será permanentemente removido do sistema,
                  incluindo seus arquivos associados (fotos e documentos).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteItemMutation.isPending}
                >
                  {deleteItemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Deletar Item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Informações principais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Detalhes básicos do item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID</Label>
              <p className="text-sm">{item.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Group UUID</Label>
              <p className="text-sm break-all">{item.group?.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
              <p className="text-sm">{item.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
              <div className="mt-1">
                <Badge variant={getTypeBadgeVariant(item.type)}>
                  {item.type === ItemType.Equipment ? "Equipamento" : "Consumível"}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status === ItemStatus.Available && "Disponível"}
                  {item.status === ItemStatus.InUse && "Em Uso"}
                  {item.status === ItemStatus.Maintenance && "Manutenção"}
                  {item.status === ItemStatus.Consumed && "Consumido"}
                </Badge>
              </div>
            </div>
            {item.group.category && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                <p className="text-sm">{item.group.category.name}</p>
              </div>
            )}
            {item.group.tags && item.group.tags.length > 0 && (
              <div className="md:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                <p className="text-sm truncate" title={item.group.tags.map(t => t.name).join(', ')}>
                  {item.group.tags.map(t => t.name).join(', ')}
                </p>
              </div>
            )}
            {item.location && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Localização</Label>
                <p className="text-sm">{item.location}</p>
              </div>
            )}
            {item.price && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Preço</Label>
                <p className="text-sm">R$ {item.price.toFixed(2)}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data de Aquisição</Label>
              <p className="text-sm">
                {item.acquisitionAt ? formatSafeDate(item.acquisitionAt, "dd/MM/yyyy") : "—"}
              </p>
            </div>
            {item.project && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Projeto</Label>
                <p className="text-sm">
                  ID: {item.project.id}{item.project.owner?.email ? ` • Dono: ${item.project.owner.email}` : ''}
                </p>
              </div>
            )}
            {item.movements && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Movimentos</Label>
                <p className="text-sm">{item.movements.length} registro(s)</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <p className="text-sm">
                {formatSafeDate(item.createAt, "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Atualizado em</Label>
              <p className="text-sm">
                {formatSafeDate(item.updateAt, "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          </div>
          {item.description && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="text-sm mt-1">{item.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visão Compacta do Grupo (comentada até criarmos componente compartilhado) */}
      {/* {item.group?.id && (
        <GroupManager groupUuid={item.group.id} compact />
      )} */}

      {/* Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
          <CardDescription>Histórico de entradas, saídas e transferências</CardDescription>
        </CardHeader>
        <CardContent>
          {!item.movements || item.movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="space-y-3">
              {item.movements.map((m) => (
                <div key={m.id} className="border rounded-lg p-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data:</span>{' '}
                      <span>{formatSafeDate(m.createdAt, "dd/MM/yyyy 'às' HH:mm")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>{' '}
                      <span className="uppercase">{m.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantidade:</span>{' '}
                      <span>{m.quantity}</span>
                    </div>
                    {m.user && (
                      <div>
                        <span className="text-muted-foreground">Usuário:</span>{' '}
                        <span>{m.user.email || m.user.username || `#${m.user.id}`}</span>
                      </div>
                    )}
                    {m.project && (
                      <div>
                        <span className="text-muted-foreground">Projeto:</span>{' '}
                        <span>#{m.project.id}{m.project.name ? ` • ${m.project.name}` : ''}</span>
                      </div>
                    )}
                  </div>
                  {m.notes && (
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Notas:</span>{' '}
                      <span>{m.notes}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Dialog: Editar Item */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Atualize os dados permitidos deste item
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ItemForm
              item={item }
              hideName
              hideType
              hideCategory
              hideDescription
              hideConsumableDetails
              hideQuantity
              hideMediaSection
              onSuccess={() => {
                setIsEditDialogOpen(false)
                queryClient.invalidateQueries({ queryKey: ["item", itemId] })
                queryClient.invalidateQueries({ queryKey: ["item-group", item?.group?.id] })
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 