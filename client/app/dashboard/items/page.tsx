"use client";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAPI } from "@/hooks/useAPI";
import { formatCurrency } from "@/lib/formats";
import { isSuccessResponse } from "@/lib/response";
import { useSession } from "@/stores/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  LayoutGrid,
  Loader2,
  Package2,
  Plus,
  Rows,
  Search,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  createdAt: string;
  assetCode?: string | null;
  serial?: string | null;
  category?: { id: number; name: string } | null;
  tags?: Array<{ id: number; name: string }>;
}

// Defina um tamanho de página para ser reutilizado
const DEFAULT_PAGE_SIZE = 10;

export default function ItemsPage() {
  const router = useRouter();
  const isAuthenticated = useSession((state) => !!state.user);
  const { client } = useAPI();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const userId = useSession((state) => state.user?.id || "guest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');

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
    } catch { }
  }, [userId])

  // Salvar preferência ao alterar
  useEffect(() => {
    const key = `items:viewMode:${userId}`
    try {
      localStorage.setItem(key, viewMode)
    } catch { }
  }, [viewMode, userId])

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["items", "group", page, pageSize, debouncedSearch, orderDirection],
    queryFn: async () => {
      // Constrói os parâmetros da URL dinamicamente
      const response = await client.query(
        "/item",
        "get",
        { query: { pageSize: String(pageSize), page: String(page), groupBy: "groupUuid", search: debouncedSearch || undefined, orderDirection } }
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
      const deletedCount = (response as { data?: { deletedItems?: number } }).data?.deletedItems ?? 1
      const deletedFiles = (response as { data?: { deletedFiles?: number } }).data?.deletedFiles ?? 0

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

  // Definição de colunas para a visualização em lista (tabela)
  const columns: ColumnDef<Item & { group?: any }>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => {
        const item = row.original
        const title = item.serial?.length ? item.serial : (item.assetCode?.length ? item.assetCode : item.name)
        return (
          <div className="font-medium">{title}</div>
        )
      }
    },
    {
      id: 'groupUuid',
      header: 'UUID do Grupo',
      cell: ({ row }) => row.original.groupUuid ?? '—'
    },
    {
      id: 'category',
      header: 'Categoria',
      cell: ({ row }) => row.original.category?.name ?? '—'
    },
    {
      id: 'quantity',
      header: 'Qtd',
      cell: ({ row }) => (row.original as { quantity?: number }).quantity ?? 0
    },
    {
      id: 'price',
      header: 'Preço',
      cell: ({ row }) => typeof row.original.price === 'number' ? formatCurrency(row.original.price) : '—'
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2 justify-end">
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
        )
      }
    },
  ]

  return (
    <div className="space-y-6">
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

      {error ? (
        <div className="text-center py-8 text-red-500">
          Erro ao carregar itens: {(error as Error).message}
        </div>
      ) : (
        <DataTable<Item & { group?: any }, unknown>
          columns={columns}
          data={(data?.data as (Item & { group?: any })[]) ?? []}
          title="Lista de Itens"
          description="Visualize e gerencie os itens do sistema"
          isLoading={isLoading}
          onRefresh={() => refetch()}
          enableSearch={false}
          serverPagination={{
            pageIndex: page - 1,
            pageSize,
            total: data?.metadata?.total || 0,
            totalPages: totalPages,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
            onPageSizeChange: (next) => {
              setPageSize(next)
              setPage(1)
            },
          }}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
          sortDirection={orderDirection}
          onSortDirectionToggle={() => setOrderDirection((d) => (d === 'DESC' ? 'ASC' : 'DESC'))}
          renderGridItem={(item) => (
            <div className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold">
                  {item.serial?.length ? item.serial : (item.assetCode?.length ? item.assetCode : item.name)}
                  {item.serial?.length && item.assetCode?.length ? ` • ${item.assetCode}` : ''}
                </h3>
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
          )}
        />
      )}
    </div>
  );
}