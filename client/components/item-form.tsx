"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Item, ItemType, EquipmentStatus, Category } from "@/lib/types"
import { mockCategories } from "@/lib/data" // Mock categories
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, UploadCloud, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"

interface ItemFormProps {
  item?: Item // For editing
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { client } = useAPI()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(item?.name || "")
  const [type, setType] = useState<ItemType>(item?.type || "equipment")
  const [selectedCategory, setSelectedCategory] = useState(item?.category || "")
  const [description, setDescription] = useState(item?.description || "")
  const [serialNumber, setSerialNumber] = useState(item?.serialNumber || "")
  const [brand, setBrand] = useState(item?.brand || "")
  const [model, setModel] = useState(item?.model || "")
  const [acquisitionDate, setAcquisitionDate] = useState<Date | undefined>(
    item?.acquisitionDate ? new Date(item.acquisitionDate) : undefined,
  )
  const [value, setValue] = useState<number | string>(item?.value || "")
  const [location, setLocation] = useState(item?.location || "")
  const [status, setStatus] = useState<EquipmentStatus | undefined>(item?.status)
  const [minStockLevel, setMinStockLevel] = useState<number | string>(item?.minStockLevel || "")
  const [currentStock, setCurrentStock] = useState<number | string>(item?.currentStock || "")

  const categories: Category[] = mockCategories // Use mock categories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      
      // Preparar os dados do formulário
      const formData = {
        name,
        type,
        category: selectedCategory,
        description,
        serialNumber: type === "equipment" ? serialNumber : undefined,
        brand: type === "equipment" ? brand : undefined,
        model: type === "equipment" ? model : undefined,
        acquisitionDate: acquisitionDate ? format(acquisitionDate, "yyyy-MM-dd") : undefined,
        value: value ? Number(value) : undefined,
        location: type === "equipment" ? location : undefined,
        status: type === "equipment" ? status : undefined,
        minStockLevel: type === "consumable" ? Number(minStockLevel) : undefined,
        currentStock: type === "consumable" ? Number(currentStock) : undefined,
      }

      // Log para debug
      console.log("Enviando dados do formulário:", formData)
      
      if (item) {
        // Atualizar item existente
        const response = await client.query(`/item/${item.id}`, "put", formData);
        if (!('data' in response)) {
          throw new Error(response.message);
        }
      } else {
        // Criar novo item
        const response = await client.query("/item/create", "post", formData);
        if (!('data' in response)) {
          throw new Error(response.message);
        }
      }
      
      toast({
        title: item ? "Item Atualizado!" : "Item Criado!",
        description: `O item "${name}" foi ${item ? "atualizado" : "criado"} com sucesso.`,
      })
      
      router.push("/dashboard/items") // Redirecionar após o envio
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${item ? "atualizar" : "criar"} o item. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{item ? "Editar Item" : "Adicionar Novo Item"}</CardTitle>
          <CardDescription>Preencha os detalhes do equipamento ou insumo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Impressora 3D XYZ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value as ItemType)}
                className="flex space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equipment" id="equipment" />
                  <Label htmlFor="equipment">Equipamento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consumable" id="consumable" />
                  <Label htmlFor="consumable">Insumo</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre o item..."
            />
          </div>

          {type === "equipment" && (
            <>
              <h3 className="text-lg font-medium border-t pt-4">Detalhes do Equipamento</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Série</Label>
                  <Input
                    id="serialNumber"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="S/N"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Fabricante" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Modelo específico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!acquisitionDate && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {acquisitionDate ? (
                          format(acquisitionDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={acquisitionDate}
                        onSelect={setAcquisitionDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização Física</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Bancada A1, Prateleira B2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as EquipmentStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="functional">Funcional</SelectItem>
                      <SelectItem value="in_maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="out_of_use">Fora de Uso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {type === "consumable" && (
            <>
              <h3 className="text-lg font-medium border-t pt-4">Detalhes do Insumo</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Nível Mínimo de Estoque</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Mídia e Documentação</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="photos">Fotos do Item</Label>
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="photos-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG ou GIF (MAX. 800x400px)</p>
                    </div>
                    <Input id="photos-input" type="file" className="hidden" multiple />
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentation">Documentação Técnica</Label>
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="docs-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 5MB)</p>
                    </div>
                    <Input id="docs-input" type="file" className="hidden" multiple />
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {item ? "Salvando..." : "Adicionando..."}
              </>
            ) : (
              item ? "Salvar Alterações" : "Adicionar Item"
            )}
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.back()} 
            className="ml-auto w-full md:w-auto"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
