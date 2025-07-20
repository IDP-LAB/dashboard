"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockItems } from "@/lib/data"
import type { Project, ProjectItem } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Plus } from "lucide-react"

interface AssociateItemsDialogProps {
  project: Project
  onClose: () => void
}

export function AssociateItemsDialog({ project, onClose }: AssociateItemsDialogProps) {
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [associatedItems, setAssociatedItems] = useState<ProjectItem[]>(project.associatedItems || [])

  const availableItems = mockItems.filter((item) => !associatedItems.some((assoc) => assoc.itemId === item.id))

  const handleAddItem = () => {
    if (!selectedItem) return

    const item = mockItems.find((i) => i.id === selectedItem)
    if (!item) return

    const newAssociation: ProjectItem = {
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      quantityAllocated: item.type === "consumable" ? Number(quantity) : undefined,
      dateAllocated: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
    }

    setAssociatedItems([...associatedItems, newAssociation])
    setSelectedItem("")
    setQuantity("")
    setNotes("")

    toast({
      title: "Item associado!",
      description: `${item.name} foi associado ao projeto.`,
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setAssociatedItems(associatedItems.filter((item) => item.itemId !== itemId))
    toast({
      title: "Item removido!",
      description: "Item foi removido do projeto.",
    })
  }

  const handleSave = () => {
    // TODO: Implementar lógica de salvamento
    console.log("Saving associated items:", associatedItems)
    toast({
      title: "Itens salvos!",
      description: "Associações de itens foram atualizadas.",
    })
    onClose()
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Associar Itens ao Projeto</CardTitle>
        <CardDescription>Projeto: {project.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar item */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                        {item.type === "consumable" && ` (${item.currentStock} ${item.unit})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && mockItems.find((i) => i.id === selectedItem)?.type === "consumable" && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddItem} disabled={!selectedItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de itens associados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens Associados ({associatedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {associatedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum item associado ao projeto.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data Alocação</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatedItems.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={item.itemType === "equipment" ? "outline" : "secondary"}>
                          {item.itemType === "equipment" ? "Equipamento" : "Insumo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.quantityAllocated || "-"}</TableCell>
                      <TableCell>{new Date(item.dateAllocated).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{item.notes || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Salvar Associações
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
