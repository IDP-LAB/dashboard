"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users,
  Package,
  Save,
  AlertTriangle,
  Loader2,
  Plus,
  Eye,
  Upload,
  FileText,
  Image
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
import { ItemForm } from "@/components/item-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileViewer } from "@/components/file-viewer"
import { formatCurrency } from "@/lib/formats"

interface GroupItem {
  id: number
  name: string
  description?: string
  location?: string
  type: ItemType
  status: ItemStatus
  price?: number
  groupUuid: string
  createdAt: string
  updateAt: string
  assetCode?: string | null
  serial?: string | null
  category?: {
    id: number
    name: string
  }
  files?: Array<{
    id: number
    filename: string
    mimeType: string
    size: number
    type: 'photo' | 'document'
  }>
  tags?: Array<{ id: number; name: string }>
}

export default function EditGroupPage() {
  const params = useParams()
  const router = useRouter()
  const { client } = useAPI()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<'item' | 'group' | 'new'>('item')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // O parâmetro 'groupUuid' vem diretamente da URL
  const groupUuid = params.groupUuid as string

  // Query para buscar todos os itens do grupo usando o groupUuid
  const { data: groupItems, isLoading, error } = useQuery({
    queryKey: ["item-group", groupUuid],
    queryFn: async () => {
      const response = await client.query("/group/:groupUuid" , "get", { groupUuid })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response.data as GroupItem[]
    },
    enabled: !!groupUuid
  })

  // Query para buscar arquivos do grupo
  const { data: groupFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["group-files", groupUuid],
    queryFn: async () => {
      const response = await client.query("/group/:groupUuid/files" , "get", { groupUuid })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response.data
    },
    enabled: !!groupUuid
  })

  // Mutação para deletar grupo completo
  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await client.query("/group/:groupUuid", "delete", { groupUuid }, { returnProducts: false })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: (response) => {
      const deletedCount = (response.data )?.deletedItems || 0
      const deletedFiles = (response.data )?.deletedFiles || 0
      
      toast({
        title: "Grupo deletado",
        description: `${deletedCount} item(s) e ${deletedFiles} arquivo(s) removidos com sucesso.`,
      })
      router.push("/dashboard/items")
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  // Mutação para deletar item individual
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await client.query("/item/:id", "delete", { id: itemId }, { returnProducts: false })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: (response) => {
      const deletedFiles = (response.data )?.deletedFiles || 0
      
              toast({
          title: "Item deletado",
          description: `Item e ${deletedFiles} arquivo(s) removidos com sucesso.`,
        })
        queryClient.invalidateQueries({ queryKey: ["item-group", groupUuid] })
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  // Mutação para upload de arquivos
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      
      const response = await client.uploadFile("/group/:groupUuid/files" , "post", formData, { groupUuid })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast({
        title: "Arquivos enviados",
        description: "Os arquivos foram enviados com sucesso.",
      })
      setUploadFiles([])
      setIsUploadDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["group-files", groupUuid] })
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  // Mutação para deletar arquivo
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await client.query("/group/:groupUuid/files/:fileId" , "delete", { groupUuid, fileId })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: () => {
      toast({
        title: "Arquivo deletado",
        description: "O arquivo foi removido com sucesso.",
      })
      queryClient.invalidateQueries({ queryKey: ["group-files", groupUuid] })
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const handleDeleteGroup = () => {
    deleteGroupMutation.mutate()
  }

  const handleDeleteItem = (item: GroupItem) => {
    deleteItemMutation.mutate(item.id)
  }

  const handleEditItem = (item: GroupItem) => {
    setEditMode('item')
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }
  const handleViewItem = (id: number) => router.push(`/dashboard/items/${id}`);

  const handleEditGroup = () => {
    if (groupItems && groupItems.length > 0) {
      setEditMode('group')
      setEditingItem(groupItems[0]) // Usar o primeiro item como template para edição em grupo
      setIsEditDialogOpen(true)
    }
  }

  const handleAddNewItem = () => {
    setEditMode('new')
    setEditingItem(firstItem) // Usar o primeiro item como template compartilhado
    setIsEditDialogOpen(true)
  }

  const handleUpload = () => {
    if (uploadFiles.length > 0) {
      uploadFilesMutation.mutate(uploadFiles)
    }
  }

  const handleDeleteFile = (fileId: number) => {
    deleteFileMutation.mutate(fileId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const formatSafeDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !groupItems || groupItems.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Erro
            </CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Grupo não encontrado"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const firstItem = groupItems[0]
  if (!firstItem) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Erro
            </CardTitle>
            <CardDescription>
              Nenhum item encontrado no grupo
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  console.log("groupItems", groupItems)

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
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Grupo</h1>
            <p className="text-muted-foreground">
              Gerencie {groupItems.length} item(s) do grupo "{firstItem.name}"
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleAddNewItem}
            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300" 
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Item
          </Button>
          <Button 
            onClick={handleEditGroup}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300" 
            variant="outline"
          >
            <Users className="mr-2 h-4 w-4" />
            Editar Grupo
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                disabled={deleteGroupMutation.isPending}
              >
                {deleteGroupMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Deletar Grupo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar grupo completo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os {groupItems.length} item(s) do grupo "{firstItem.name}" 
                  (groupUuid: {firstItem.groupUuid}) serão permanentemente removidos do sistema, 
                  incluindo todos os arquivos associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteGroup}
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={deleteGroupMutation.isPending}
                >
                  Deletar Grupo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Informações do Grupo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Informações do Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome</p>
            <p className="text-lg font-semibold">{firstItem.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Categoria</p>
            <p className="text-lg">{firstItem.category?.name || 'Sem categoria'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tipo</p>
            <Badge variant={getTypeBadgeVariant(firstItem.type)}>
              {firstItem.type === ItemType.Equipment ? 'Equipamento' : 'Insumo'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
            <p className="text-lg font-semibold">{groupItems.length}</p>
          </div>

          {/* Tags agregadas do grupo */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Tags</p>
            <p className="text-sm">
              {(() => {
                const tagNames = Array.from(new Set(
                  (groupItems.flatMap((it) => it.tags?.map((t) => t.name) || []) as string[])
                ))
                return tagNames.length > 0 ? tagNames.join(', ') : 'Sem tags'
              })()}
            </p>
          </div>

          {/* Contagens por status */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
            <p className="text-lg font-semibold text-green-600">
              {groupItems.filter((i) => i.status === ItemStatus.Available).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
            <p className="text-lg font-semibold text-red-600">
              {groupItems.filter((i) => i.status === ItemStatus.Maintenance).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Em Uso</p>
            <p className="text-lg font-semibold text-orange-600">
              {groupItems.filter((i) => i.status === ItemStatus.InUse).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Consumidos</p>
            <p className="text-lg font-semibold text-gray-600">
              {groupItems.filter((i) => i.status === ItemStatus.Consumed).length}
            </p>
          </div>

          {/* Valor total estimado */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor Total Estimado</p>
            <p className="text-lg font-semibold">
              {formatCurrency(groupItems.reduce((sum, it) => sum + (it.price || 0), 0))}
            </p>
          </div>

          {/* Descrição e UUID */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Descrição</p>
            <p className="text-sm">{firstItem.description || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">UUID</p>
            <p className="text-sm break-all">{firstItem.groupUuid}</p>
          </div>
        </CardContent>
      </Card>

      {/* Arquivos do Grupo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Arquivos do Grupo</CardTitle>
            <CardDescription>Documentos e fotos relacionados ao grupo de itens</CardDescription>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Arquivos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Arquivos</DialogTitle>
                <DialogDescription>
                  Selecione os arquivos que deseja enviar para este grupo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Selecionar Arquivos</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setUploadFiles(Array.from(e.target.files))
                      }
                    }}
                  />
                </div>
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Arquivos selecionados:</Label>
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploadFiles.length === 0 || uploadFilesMutation.isPending}
                  >
                    {uploadFilesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !groupFiles || groupFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhum arquivo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupFiles.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {file.type === 'photo' ? (
                        <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.originalName || file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {formatSafeDate(String(file.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <FileViewer
                        file={{
                          id: file.id,
                          filename: file.filename,
                          mimeType: file.mimeType,
                          size: file.size,
                          type: file.type
                        }}
                        groupUuid={groupUuid}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar arquivo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O arquivo "{file.originalName || file.filename}" será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteFile(file.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                              disabled={deleteFileMutation.isPending}
                            >
                              {deleteFileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Itens do Grupo */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Grupo</CardTitle>
          <CardDescription>
            Lista individual de cada item no grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">
                        {item.serial?.length ? item.serial : (item.assetCode?.length ? item.assetCode : `Item #${item.id}`)}
                        {item.serial?.length && item.assetCode?.length ? ` • ${item.assetCode}` : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.location && `Local: ${item.location}`}
                        {item.files && item.files.length > 0 && ` • ${item.files.length} arquivo(s)`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em: {formatSafeDate(item.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status === ItemStatus.Available && 'Disponível'}
                      {item.status === ItemStatus.InUse && 'Em Uso'}
                      {item.status === ItemStatus.Maintenance && 'Manutenção'}
                      {item.status === ItemStatus.Consumed && 'Consumido'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                <Button 
                    onClick={() => handleViewItem(item.id)} 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Detalhes
                  </Button>
                  <Button 
                    onClick={() => handleEditItem(item)}
                    variant="outline" 
                    size="sm"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Item
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar item individual?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O item #{item.id} será permanentemente 
                          removido do sistema, incluindo seus arquivos associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteItem(item)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Deletar Item
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar item */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode === 'group' 
                ? `Editar Grupo (${groupItems?.length || 0} itens)`
                : editMode === 'new'
                ? "Adicionar Novo Item ao Grupo"
                : `Editar Item #${editingItem?.id}`}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'group'
                ? "As alterações serão aplicadas a todos os itens do grupo"
                : editMode === 'new'
                ? "Criar um novo item que fará parte deste grupo"
                : "As alterações serão aplicadas apenas a este item"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ItemForm 
              item={editMode === 'new' ? undefined : ((editingItem || undefined) as any)}
              isGroupEdit={editMode === 'group'}
              hideQuantity={editMode !== 'new' ? (editMode === 'item' || editMode === 'group') : true}
              hideMediaSection={true}
              groupUuid={groupUuid}
              disableSharedFields={editMode === 'new'}
              sharedTemplate={editMode === 'new' ? {
                name: firstItem.name,
                category: firstItem.category ,
                description: firstItem.description
              } : undefined}
              hideName={editMode === 'item'}
              hideType={editMode === 'item'}
              disableType={editMode === 'new'}
              hideCategory={editMode === 'item'}
              hideTags={editMode !== 'group'}
              hideDescription={editMode === 'item'}
              hideConsumableDetails={editMode === 'item'}
              hideAcquisitionDate={editMode === 'group'}
              hideStatus={editMode === 'group'}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setEditingItem(null)
                setEditMode('item')
                queryClient.invalidateQueries({ queryKey: ["item-group", groupUuid] })
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 