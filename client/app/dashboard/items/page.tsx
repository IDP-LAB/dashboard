"use client";

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Search,
  Package2,
  Loader2,
  AlertTriangle, 
  LayoutGrid, 
  Rows 
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/stores/auth"
import { formatCurrency } from "@/lib/formats";

interface Item {
  id: number;
  name: string;
  barcode?: string;
  description?: string;
  location?: string;
  type: string;
  status: string;
  price?: number | null;
  quantity?: number;
  groupUuid?: string; // agora pode vir do backend
  createAt: string;
  category?: { id: number; name: string } | null;
  tags?: Array<{ id: number; name: string }>;
}

// Defina um tamanho de página para ser reutilizado
const PAGE_SIZE = 10;

export default function ItemsPage() {
  const router = useRouter();
  const isAuthenticated = useSession((state) => !!state.user);
  const { client } = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const userId = useSession((state) => state.user?.id || "guest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1)
    }, 500)

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Carregar preferência de visualização do localStorage
  useEffect(() => {
    const key = `items:viewMode:${userId}`
    try {
      const stored = localStorage.getItem(key)
      if (stored === 'grid' || stored === 'list') setViewMode(stored)
    } catch {}
  }, [userId])

  // Salvar preferência ao alterar
  useEffect(() => {
    const key = `items:viewMode:${userId}`
    try {
      localStorage.setItem(key, viewMode)
    } catch {}
  }, [viewMode, userId])

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["items", "group", page, debouncedSearch],
    queryFn: async () => {
      // Constrói os parâmetros da URL dinamicamente
      const params = new URLSearchParams({
        pageSize: String(PAGE_SIZE),
        page: String(page),
        groupBy: "groupUuid",
      });

      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await client.query(
        `/item?${params.toString()}` as "/item",
        "get",
        undefined
      );
      if (!isSuccessResponse(response)) throw new Error(response.message);

      return response;
    },
    enabled: isAuthenticated
  });

  // Mutação para deletar grupo de itens
  const deleteGroupMutation = useMutation<any, Error, string>({
    mutationFn: async (groupUuid: string) => {
      const response = await client.query("/group/:groupUuid", "delete", { groupUuid }, { returnProducts: false })
      if (!isSuccessResponse(response)) throw new Error(response.message)
      return response
    },
    onSuccess: (response) => {
      const deletedCount = (response as { data?: { deletedItems?: number }}).data?.deletedItems ?? 1
      const deletedFiles = (response as { data?: { deletedFiles?: number }}).data?.deletedFiles ?? 0
      
      let description = `${deletedCount} item(s) do grupo foram removidos com sucesso.`
      if (deletedFiles > 0) {
        description += ` ${deletedFiles} arquivo(s) também foram removidos.`
      }
      
      toast({
        title: "Grupo deletado",
        description,
      })
      
      // Invalidar e refetch da lista de itens
      queryClient.invalidateQueries({ queryKey: ["items", "group"] })
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  })

  const handleNewItem = () => router.push("/dashboard/items/new");
  const handleEditGroup = (groupUuid: string) => router.push(`/dashboard/group/${groupUuid}`);
  const handleDeleteGroup = (item: any) => {
    deleteGroupMutation.mutate(item.groupUuid)
  };

  const totalPages = data?.metadata?.totalPages || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens</h1>
          <p className="text-muted-foreground">Gerencie os itens do estoque</p>
        </div>
        <Button onClick={handleNewItem} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Itens</CardTitle>
          <CardDescription>
            Pesquise por nome, código de barras ou descrição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Buscar
              </Label>
              <Input
                id="search"
                placeholder="Digite para buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button disabled>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Itens</CardTitle>
            <CardDescription>
              {data?.metadata?.total || 0} grupo(s) de itens encontrados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
              aria-label="Visualização em grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
              aria-label="Visualização em lista"
            >
              <Rows className="h-4 w-4" />
            </Button>
            {/* O isFetching indica que uma busca em segundo plano está acontecendo */}
            {isFetching && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar itens: {(error as Error).message}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum item encontrado</p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data?.data?.map((item: Item & { group?: any }) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>UUID: {item.groupUuid}</span>
                        {(item as { quantity?: number }).quantity && <span>• Qtd: {(item as { quantity?: number }).quantity}</span>}
                        {item.category?.name && <span>• {item.category.name}</span>}
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            •
                            <span className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((t) => (
                                <Badge key={t.id} variant="secondary" className="text-[10px] px-1 py-0">
                                  {t.name}
                                </Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">+{item.tags.length - 3}</Badge>
                              )}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {typeof item.price === 'number' ? (
                        <span className="text-xs text-muted-foreground">{formatCurrency(item.price)}</span>
                      ) : <span />}
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleEditGroup(item.groupUuid as string)} variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                          <Edit className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" disabled={deleteGroupMutation.isPending}>
                              {deleteGroupMutation.isPending && String(deleteGroupMutation.variables) === String(item.groupUuid) ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Deletar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar grupo de itens?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Todos os itens do grupo "{item.name}" (groupUuid: {item.groupUuid}) serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGroup(item)} className="bg-red-600 text-white hover:bg-red-700" disabled={deleteGroupMutation.isPending}>
                                {deleteGroupMutation.isPending && String(deleteGroupMutation.variables) === String(item.groupUuid) && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Deletar Grupo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {data?.data?.map((item: Item & { group?: any }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>UUID: {item.groupUuid}</span>
                        {(item as { quantity?: number }).quantity && <span>• Quantidade: {(item as { quantity?: number }).quantity}</span>}
                        {item.group.category?.name && <span>• Categoria: {item.group.category.name}</span>}
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            • Tags:
                            <span className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 4).map((t) => (
                                <Badge key={t.id} variant="secondary" className="text-[10px] px-1 py-0">
                                  {t.name}
                                </Badge>
                              ))}
                              {item.tags.length > 4 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">+{item.tags.length - 4}</Badge>
                              )}
                            </span>
                          </span>
                        )}
                        {typeof item.price === 'number' && (
                          <span>• Valor estimado/unit: R$ {item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                                                  onClick={() => handleEditGroup(item.groupUuid as string)} 
                        variant="outline" 
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            disabled={deleteGroupMutation.isPending}
                          >
                            {deleteGroupMutation.isPending && String(deleteGroupMutation.variables) === String(item.groupUuid) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar grupo de itens?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Todos os itens do grupo "{item.name}" 
                              (groupUuid: {item.groupUuid}) serão permanentemente removidos do sistema, 
                              incluindo todos os arquivos associados (fotos e documentos).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGroup(item)}
                              className="bg-red-600 text-white hover:bg-red-700"
                              disabled={deleteGroupMutation.isPending}
                            >
                              {deleteGroupMutation.isPending && String(deleteGroupMutation.variables) === String(item.groupUuid) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Deletar Grupo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
        {/* 5. Controles de paginação no rodapé do Card */}
        {totalPages > 0 && (
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((old) => Math.max(old - 1, 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((old) => old + 1)}
                  disabled={page >= totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}