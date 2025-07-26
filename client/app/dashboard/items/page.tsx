"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAPI } from "@/hooks/useAPI";
import { useSession } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package2, Plus, Search } from "lucide-react";
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
  price?: number;
  groupUuid: string;
  createAt: string;
}

export default function ItemsPage() {
  const router = useRouter();
  const isAuthenticated = useSession((state) => !!state.user);
  const { client } = useAPI();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["items", search],
    queryFn: async () => {
      const response = await client.query("/item", "get", {
        page: 1,
        pageSize: 20,
        search: search.length > 0 ? search : undefined,
      });

      if ('data' in response) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    },
    enabled: isAuthenticated,
  });
  
  const handleNewItem = () => {
    router.push("/dashboard/items/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens</h1>
          <p className="text-muted-foreground">
            Gerencie os itens do estoque
          </p>
        </div>
        <Button onClick={handleNewItem}>
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
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Itens</CardTitle>
          <CardDescription>
            {data?.metadata?.total || 0} itens encontrados
          </CardDescription>
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
            <div className="space-y-4">
              {data?.data?.map((item: Item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.barcode && `Código: ${item.barcode} • `}
                      {item.location && `Local: ${item.location} • `}
                      Status: {item.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
