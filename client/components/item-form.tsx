"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, UploadCloud } from "lucide-react"

import { useAPI } from "@/hooks/useAPI"
import { mockCategories } from "@/lib/data"; // Mock categories
import { isSuccessResponse } from "@/lib/response"
import { ItemStatus, ItemType, type ItemProperties,  } from "server"; // Adapte conforme sua estrutura
import { InputNumber } from "./ui/inputnumber"

// Defina um schema de validação com Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  type: z.nativeEnum(ItemType),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
  description: z.string().optional(),
  acquisitionAt: z.date().optional(),
  price: z.number().optional(),
  quantity: z.number().positive().min(1),
  location: z.string().optional(),
  status: z.nativeEnum(ItemStatus),
  minStockLevel: z.number().optional(),
  currentStock: z.number().optional(),
})

export function ItemForm({ item }: {
  item?: ItemProperties
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { client } = useAPI()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      type: item?.type || ItemType.Equipment,
      category: item?.category,
      description: item?.description || "",
      acquisitionAt: item?.acquisitionAt ? new Date(item.acquisitionAt) : undefined,
      price: item?.price || undefined,
      location: item?.location || "",
      status: item?.status,
      quantity: 1
      // Adapte os campos de estoque conforme sua 'ItemProperties'
      // minStockLevel: item?.minStockLevel || undefined,
      // currentStock: item?.currentStock || undefined,
    },
  })

  const { formState: { isSubmitting }, watch } = form
  const itemType = watch("type") // Observa o campo 'type' para renderização condicional

  const categories = mockCategories // Use suas categorias

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = {
        ...values,
        acquisitionAt: values.acquisitionAt ? format(values.acquisitionAt, "yyyy-MM-dd") : undefined,
      }

      console.log("Enviando dados do formulário:", formData)

      const changedData = {
        name: formData.name,
        type: formData.type,
        status: formData.status ?? undefined,
        price: formData.price ?? undefined,
        category: formData.category,
        quantity: formData.quantity,
        description: formData.description,
        location: formData.location,
      }

      if (item) {
        // Atualizar item existente
        const response = await client.query(`/item/:id`, "put", { id: item.id }, changedData);
        if (!isSuccessResponse(response)) throw new Error(response.message);
      } else {
        // Criar novo item
        const response = await client.query("/item", "post", changedData);
        if (!isSuccessResponse(response)) throw new Error(response.message);
      }

      toast({
        title: item ? "Item Atualizado!" : "Item Criado!",
        description: `O item "${values.name}" foi ${item ? "atualizado" : "criado"} com sucesso.`,
      })

      router.push("/dashboard/items") // Redirecionar após o envio
      router.refresh() // Opcional: para recarregar os dados na página de destino
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${item ? "atualizar" : "criar"} o item. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`,
        variant: "destructive"
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{item ? "Editar Item" : "Adicionar Novo Item"}</CardTitle>
            <CardDescription>Preencha os detalhes do equipamento ou insumo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Impressora 3D XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="equipment" />
                          </FormControl>
                          <FormLabel className="font-normal">Equipamento</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="consumable" />
                          </FormControl>
                          <FormLabel className="font-normal">Insumo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={(value) => field.onChange(JSON.parse(value))} defaultValue={JSON.stringify(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={JSON.stringify(cat)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o item..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <InputNumber
                      placeholder="Quantidade de itens..."
                      positive
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-medium border-t pt-4">Detalhes do Equipamento</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="acquisitionAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Aquisição</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={event => field.onChange(+event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização Física</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bancada A1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="maintenance">Em Manutenção</SelectItem>
                        <SelectItem value="in_use">Em Uso</SelectItem>
                        <SelectItem value="consumed">Consumido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {itemType === "consumable" && (
                <>
                <h3 className="text-lg font-medium border-t pt-4">Detalhes do Insumo</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nível Mínimo de Estoque</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            placeholder="Ex: 5"
                            {...field}
                            onChange={event => field.onChange(+event.target.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estoque Atual</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            placeholder="Ex: 10"
                            {...field}
                            onChange={event => field.onChange(+event.target.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                </>
            )}

            {/* Campos de Upload - A lógica de upload de arquivos deve ser implementada separadamente */}
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
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG ou GIF</p>
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
                        <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
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
    </Form>
  )
}