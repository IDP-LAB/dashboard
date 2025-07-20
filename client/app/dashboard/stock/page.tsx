"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StockLevelsChart } from "@/components/charts/stock-levels-chart"
import { MaterialConsumptionChart } from "@/components/charts/material-consumption-chart"
import { StockTransactionForm } from "@/components/stock/stock-transaction-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PlusCircle, MinusCircle, ListChecks, AlertTriangle, History, Package } from "lucide-react"
import { mockStockTransactions, mockItems } from "@/lib/data"
import type { TransactionType } from "@/lib/types"

export default function StockPage() {
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const lowStockItems = mockItems
    .filter((item) => item.type === "consumable" && item.currentStock && item.minStockLevel)
    .filter((item) => item.currentStock! <= item.minStockLevel!)
    .map((item) => ({
      ...item,
      status: item.currentStock! < item.minStockLevel! * 0.5 ? "critical" : "low",
    }))

  const recentTransactions = mockStockTransactions.slice(0, 10)

  const handleTransactionClick = (type: TransactionType) => {
    setSelectedTransactionType(type)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedTransactionType(null)
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case "entry":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "exit":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "requisition":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case "entry":
        return "Entrada"
      case "exit":
        return "Saída"
      case "requisition":
        return "Requisição"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Estoque</h2>
          <p className="text-muted-foreground">Controle entradas, saídas e requisições de insumos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleTransactionClick("entry")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Entrada
          </Button>
          <Button variant="outline" onClick={() => handleTransactionClick("exit")}>
            <MinusCircle className="mr-2 h-4 w-4" /> Registrar Saída
          </Button>
          <Button onClick={() => handleTransactionClick("requisition")}>
            <ListChecks className="mr-2 h-4 w-4" /> Nova Requisição
          </Button>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas de Estoque ({lowStockItems.length})
            </CardTitle>
            <CardDescription>Itens que precisam de reposição urgente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Atual: {item.currentStock} {item.unit} | Mín: {item.minStockLevel} {item.unit}
                    </p>
                  </div>
                  <Badge variant={item.status === "critical" ? "destructive" : "secondary"}>
                    {item.status === "critical" ? "Crítico" : "Baixo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockItems.filter((i) => i.type === "consumable").length}</div>
            <p className="text-xs text-muted-foreground">Insumos cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Itens precisando reposição</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Hoje</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStockTransactions.filter((t) => t.date === new Date().toISOString().split("T")[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Movimentações registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Ativas</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStockTransactions.filter((t) => t.type === "requisition").length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Estoque */}
      <div className="grid gap-6 md:grid-cols-1">
        <StockLevelsChart />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <MaterialConsumptionChart />
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações de estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="hidden md:table-cell">Projeto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{transaction.itemName}</TableCell>
                  <TableCell>
                    <Badge className={getTransactionTypeColor(transaction.type)}>
                      {getTransactionTypeLabel(transaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{transaction.userName}</TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.projectName || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para Transações */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTransactionType && (
            <StockTransactionForm type={selectedTransactionType} onClose={handleCloseDialog} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
