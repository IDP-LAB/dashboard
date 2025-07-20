"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockItems, mockProjects, mockUsers } from "@/lib/data"
import type { TransactionType } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface StockTransactionFormProps {
  type: TransactionType
  onClose: () => void
}

export function StockTransactionForm({ type, onClose }: StockTransactionFormProps) {
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState("")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [notes, setNotes] = useState("")

  const consumableItems = mockItems.filter((item) => item.type === "consumable")
  const activeProjects = mockProjects.filter((project) => project.status === "active")

  const getTitle = () => {
    switch (type) {
      case "entry":
        return "Registrar Entrada"
      case "exit":
        return "Registrar Saída"
      case "requisition":
        return "Nova Requisição"
      default:
        return "Transação"
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de salvamento
    console.log({
      type,
      itemId: selectedItem,
      quantity: Number(quantity),
      reason,
      projectId: selectedProject || undefined,
      userId: selectedUser,
      notes,
      date: new Date().toISOString().split("T")[0],
    })

    toast({
      title: "Transação registrada!",
      description: `${getTitle()} realizada com sucesso.`,
    })

    onClose()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>Registre a movimentação de estoque</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {consumableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Estoque: {item.currentStock} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da transação"
              required
            />
          </div>

          {type === "requisition" && (
            <div className="space-y-2">
              <Label htmlFor="project">Projeto (opcional)</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user">Responsável</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Registrar {type === "entry" ? "Entrada" : type === "exit" ? "Saída" : "Requisição"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
