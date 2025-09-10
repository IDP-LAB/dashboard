"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
// Date picker substituído por react-day-picker
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, UploadCloud, X, Image, FileText, Download } from "lucide-react"

import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"
import { ItemStatus, ItemType, type ItemProperties,  } from "server"; // Adapte conforme sua estrutura
import { InputNumber } from "./ui/inputnumber"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CategoryCombobox } from "./ui/category-combobox"
import { TagMultiCombobox, type TagOption } from "./ui/tag-combobox"

// Defina um schema de validação com Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  type: z.nativeEnum(ItemType),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
  tags: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  description: z.string().optional(),
  acquisitionAt: z.date().optional(),
  price: z.number().optional(),
  quantity: z.number().positive().min(1),
  location: z.string().optional(),
  status: z.nativeEnum(ItemStatus),
  minStockLevel: z.number().optional(),
  currentStock: z.number().optional(),
  assetCode: z.string().optional(),
  serial: z.string().optional(),
})

// Opções dinâmicas de status a partir de um JSON
const statusOptions = [
  { label: "Disponível", value: "available" },
  { label: "Em Manutenção", value: "maintenance" },
  { label: "Em Uso", value: "in_use" },
  { label: "Consumido", value: "consumed" },
]

interface ItemFile {
  id: number
  filename: string
  mimeType: string
  size: number
  type: 'photo' | 'document'
  createdAt: string
  path: string
}

export function ItemForm({ 
  item, 
  isGroupEdit = false,
  hideQuantity = false,
  hideMediaSection = false,
  groupUuid,
  onSuccess,
  disableSharedFields = false,
  sharedTemplate,
  hideName = false,
  hideType = false,
  hideCategory = false,
  hideTags = false,
  hideDescription = false,
  hideConsumableDetails = false,
  disableType = false,
  hideAcquisitionDate = false,
  hideStatus = false,
  hideHeader = false,
  hideIdentificationCodes = false
}: {
  item?: ItemProperties & { category?: { id: number; name: string }; group?: { id: string } }
  isGroupEdit?: boolean
  hideQuantity?: boolean
  hideMediaSection?: boolean
  groupUuid?: string
  onSuccess?: () => void
  disableSharedFields?: boolean
  sharedTemplate?: Partial<{ name: string; category: { id: number; name: string }; description: string }>
  hideName?: boolean
  hideType?: boolean
  hideCategory?: boolean
  hideTags?: boolean
  hideDescription?: boolean
  hideConsumableDetails?: boolean
  disableType?: boolean
  hideAcquisitionDate?: boolean
  hideStatus?: boolean
  hideHeader?: boolean
  hideIdentificationCodes?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { client } = useAPI()
  const queryClient = useQueryClient()
  const [photos, setPhotos] = useState<File[]>([])
  const [documents, setDocuments] = useState<File[]>([])
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [batchAssetCodes, setBatchAssetCodes] = useState<string[]>([])
  const [batchSerials, setBatchSerials] = useState<string[]>([])

  // Uuid efetivo do grupo: prioridade para prop, depois item.group?.id ou item.groupUuid (payloads de listagem de grupo)
  const effectiveGroupUuid: string | undefined = 
    groupUuid ?? item?.group?.id ?? (item as any)?.groupUuid

  // Query para buscar arquivos existentes se estivermos editando - agora por grupo
  const { data: existingFiles } = useQuery({
    queryKey: ["group-files", effectiveGroupUuid],
    queryFn: async () => {
      if (!effectiveGroupUuid) return []
      const response = await client.query("/group/:groupUuid/files" , "get", { groupUuid: effectiveGroupUuid })
      if (!isSuccessResponse(response)) return []
      return response.data
    },
    enabled: !!effectiveGroupUuid
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: sharedTemplate?.name ?? item?.name ?? "",
      type: item?.type || ItemType.Equipment,
      category: (
        sharedTemplate?.category ??
        (item as any)?.category ??
        (item as any)?.group?.category
      ) ?? undefined,
      tags: ((item as any)?.tags as TagOption[] | undefined) ?? ((item as any)?.group?.tags as TagOption[] | undefined) ?? [],
      description: sharedTemplate?.description ?? item?.description ?? "",
      acquisitionAt: item?.acquisitionAt ? new Date(item.acquisitionAt) : undefined,
      price: item?.price || undefined,
      location: item?.location || "",
      status: item?.status ?? ("available" as unknown as ItemStatus),
      quantity: item ? 1 : 1 // Para edição, sempre 1; para criação, padrão 1
      // Adapte os campos de estoque conforme sua 'ItemProperties'
      // minStockLevel: item?.minStockLevel || undefined,
      // currentStock: item?.currentStock || undefined,
    },
  })

  const { formState: { isSubmitting }, watch, setValue } = form
  const itemType = watch("type") // Observa o campo 'type' para renderização condicional
  const tagsValues = watch("tags") as TagOption[] | undefined
  const quantityValue = watch("quantity")

  // Função para criar nova categoria quando necessário (no submit)
  const createCategoryIfNeeded = async (category: {id: number, name: string}) => {
    if (category.id === -1) {
      // É uma categoria nova que precisa ser criada
      setIsCreatingCategory(true)
      try {
        const response = await client.query("/category", "post", { name: category.name })
        if (isSuccessResponse(response)) {
          // Invalidar cache de categorias para recarregar
          queryClient.invalidateQueries({ queryKey: ["categories"] })
          return response.data as {id: number, name: string}
        }
        throw new Error("Erro ao criar categoria")
      } catch (error) {
        console.error("Erro ao criar categoria:", error)
        throw error
      } finally {
        setIsCreatingCategory(false)
      }
    }
    return category
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Criar nova categoria se necessário (agora só no submit)
      values.category = await createCategoryIfNeeded(values.category)
      
      if (item) {
        // Atualizar item existente
        const changedData: Record<string, unknown> = {
          name: values.name,
          type: values.type,
          price: values.price ?? undefined,
          category: values.category,
          description: values.description,
          location: values.location,
        }
        if ((values.serial ?? '').length > 0) changedData.serial = values.serial
        if ((values.assetCode ?? '').length > 0) changedData.assetCode = values.assetCode
        if (!hideStatus) {
          changedData.status = values.status ?? undefined
        }
        if (!hideAcquisitionDate) {
          changedData.acquisitionAt = values.acquisitionAt ? format(values.acquisitionAt, "yyyy-MM-dd") : undefined
        }
        
        let response
        if (isGroupEdit && effectiveGroupUuid) {
          // Editar todos os itens do grupo usando nova rota
          response = await (client.query as any)("/group/:groupUuid/edit", "put", { groupUuid: effectiveGroupUuid }, {
            ...changedData,
            tags: (tagsValues ?? []).map(t => t.id === -1 ? { name: t.name } : { id: t.id, name: t.name })
          } as any);
        } else {
          // Editar apenas o item individual (sem quantity, que não é aceita na rota individual)
          response = await client.query("/item/:id", "put", { id: item.id }, changedData);
        }
        
        if (!isSuccessResponse(response)) throw new Error(response.message);

        // Se há novos arquivos para enviar (agora usando rota de grupo)
        if ((photos.length > 0 || documents.length > 0) && effectiveGroupUuid) {
          const formData = new FormData()
          
          photos.forEach((photo) => {
            formData.append('files', photo)
          })
          
          documents.forEach((doc) => {
            formData.append('files', doc)
          })

          const uploadResponse = await client.uploadFile("/group/:groupUuid/files" , "post", formData, { groupUuid: effectiveGroupUuid })
          if (!isSuccessResponse(uploadResponse)) {
            console.warn("Erro no upload de arquivos:", uploadResponse.message)
            toast({
              title: "Aviso",
              description: "Item atualizado, mas houve problemas no upload dos arquivos.",
              variant: "destructive"
            })
          }
        }
      } else {
        // Criar novo item com arquivos usando RPC
        const formData = new FormData()
        
        // Adicionar dados do formulário
        formData.append('name', values.name)
        formData.append('type', values.type)
        formData.append('status', values.status ?? '')
        formData.append('quantity', values.quantity.toString())
        formData.append('category[id]', values.category.id.toString())
        formData.append('category[name]', values.category.name)
        
        if (values.description) formData.append('description', values.description)
        if (values.location) formData.append('location', values.location)
        if (values.price) formData.append('price', values.price.toString())
        if (values.acquisitionAt) formData.append('acquisitionAt', format(values.acquisitionAt, "yyyy-MM-dd"))
        if (groupUuid) formData.append('groupUuid', groupUuid)
        // Envio de códigos
        if (values.quantity > 1) {
          // Quando for batch, não enviar os campos únicos; preencher índice 0 a partir deles caso existam
          if ((values.assetCode ?? '').length > 0) {
            formData.append(`assetCodes[0]`, String(values.assetCode))
          }
          if ((values.serial ?? '').length > 0) {
            formData.append(`serials[0]`, String(values.serial))
          }
          for (let i = 0; i < values.quantity; i++) {
            const ac = batchAssetCodes[i]
            const se = batchSerials[i]
            if (ac && ac.length > 0) formData.append(`assetCodes[${i}]`, ac)
            if (se && se.length > 0) formData.append(`serials[${i}]`, se)
          }
        } else {
          // Quando for item único
          if ((values.assetCode ?? '').length > 0) formData.append('assetCode', String(values.assetCode))
          if ((values.serial ?? '').length > 0) formData.append('serial', String(values.serial))
        }
        // Tags (array)
        const tags = (tagsValues ?? []) as TagOption[]
        tags.forEach((tag, index) => {
          if (tag.id !== undefined && tag.id !== -1) {
            formData.append(`tags[${index}][id]`, String(tag.id))
          } else {
            formData.append(`tags[${index}][name]`, tag.name)
          }
        })
        
        // Adicionar arquivos
        photos.forEach((photo) => {
          formData.append('files', photo)
        })
        
        documents.forEach((doc) => {
          formData.append('files', doc)
        })

        console.log("Enviando dados do formulário com arquivos via RPC")

        const response = await client.uploadFile("/item", "post", formData)
        if (!isSuccessResponse(response)) throw new Error(response.message);
      }

      toast({
        title: item ? (isGroupEdit ? "Grupo Atualizado!" : "Item Atualizado!") : "Item Criado!",
        description: item 
          ? (isGroupEdit ? `Todos os itens do grupo "${values.name}" foram atualizados com sucesso.` : `O item "${values.name}" foi atualizado com sucesso.`)
          : `O item "${values.name}" foi criado com sucesso.`,
      })

      if (onSuccess) {
        onSuccess() // Callback para fechar dialog
      } else {
        router.push("/dashboard/items") // Redirecionar após o envio
        router.refresh() // Opcional: para recarregar os dados na página de destino
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro",
        description: `Falha ao ${item ? "atualizar" : "criar"} o item. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`,
        variant: "destructive"
      })
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files))
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Form {...(form as any)}>
      <form onSubmit={(form.handleSubmit(onSubmit as any) as any)}>
        <Card>
          {!hideHeader && (
            <CardHeader>
              <CardTitle>{item ? "Editar Item" : "Adicionar Novo Item"}</CardTitle>
              <CardDescription>Preencha os detalhes do equipamento ou insumo.</CardDescription>
            </CardHeader>
          )}
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              {!hideName && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Impressora 3D XYZ" {...field} disabled={disableSharedFields} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              )}
              {!hideType && (
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
                            <RadioGroupItem value="equipment" disabled={disableType} />
                          </FormControl>
                          <FormLabel className="font-normal">Equipamento</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="consumable" disabled={disableType} />
                          </FormControl>
                          <FormLabel className="font-normal">Insumo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              )}
            </div>

            {!hideCategory && (
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <CategoryCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione ou digite uma categoria..."
                      disabled={disableSharedFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            {!hideTags && (
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagMultiCombobox
                      values={(field.value as TagOption[] | undefined) ?? []}
                      onValuesChange={(values) => setValue("tags", values as any, { shouldDirty: true })}
                      placeholder="Selecione, busque ou crie tags (ex: Vermelho, Nacional, Marca A)"
                      disabled={disableSharedFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            {!hideDescription && (
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
                      disabled={disableSharedFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            {!hideQuantity && (
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
            )}

            {/* Códigos de identificação (mostrar apenas em edição ou quando quantidade = 1) */}
            {!hideIdentificationCodes && (item || Number(quantityValue) <= 1) && (
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="serial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} disabled={disableSharedFields} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Patrimônio</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} disabled={disableSharedFields} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Inputs adicionais quando batch (quantity > 1) */}
            {!hideIdentificationCodes && (!item && !hideQuantity && Number(quantityValue) > 1) && (
              <div className="space-y-2 border rounded-md p-4">
                <h4 className="font-medium">Códigos por item (opcional)</h4>
                <p className="text-sm text-muted-foreground">Preencha, se desejar, os códigos por unidade. Deixe em branco para não definir.</p>
                <div className="grid gap-3">
                  {Array.from({ length: Number(quantityValue) }).map((_, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-3">
                      {idx === 0 ? (
                        <>
                          <FormField
                            control={form.control}
                            name="serial"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Série do item #1</FormLabel>
                                <FormControl>
                                  <Input
                                    id={`batch-serial-${idx}`}
                                    placeholder="Opcional"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value)
                                      const copy = [...batchSerials]
                                      copy[idx] = e.target.value
                                      setBatchSerials(copy)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="assetCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patrimônio do item #1</FormLabel>
                                <FormControl>
                                  <Input
                                    id={`batch-asset-${idx}`}
                                    placeholder="Opcional"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value)
                                      const copy = [...batchAssetCodes]
                                      copy[idx] = e.target.value
                                      setBatchAssetCodes(copy)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor={`batch-serial-${idx}`}>Série do item #{idx + 1}</Label>
                            <Input
                              id={`batch-serial-${idx}`}
                              placeholder="Opcional"
                              value={batchSerials[idx] ?? ''}
                              onChange={(e) => {
                                const copy = [...batchSerials]
                                copy[idx] = e.target.value
                                setBatchSerials(copy)
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`batch-asset-${idx}`}>Patrimônio do item #{idx + 1}</Label>
                            <Input
                              id={`batch-asset-${idx}`}
                              placeholder="Opcional"
                              value={batchAssetCodes[idx] ?? ''}
                              onChange={(e) => {
                                const copy = [...batchAssetCodes]
                                copy[idx] = e.target.value
                                setBatchAssetCodes(copy)
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium border-t pt-4">Detalhes do Equipamento</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {!hideAcquisitionDate && (
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
                          <DayPicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR as any}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              {!hideStatus && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "available"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {itemType === "consumable" && !hideConsumableDetails && (
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

            {/* Campos de Upload - desabilitar quando campos compartilhados estiverem bloqueados */}
            {!hideMediaSection && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Mídia e Documentação</h3>
              
              {/* Arquivos existentes (apenas na edição) */}
              {item && existingFiles && existingFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Existentes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {existingFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          {file.type === 'photo' ? (
                            <Image className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {format(new Date(file.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                            disabled={disableSharedFields}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="photos">{item ? "Adicionar Fotos" : "Fotos do Item"}</Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="photos-input"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                        aria-disabled={disableSharedFields}
                        style={disableSharedFields ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG ou GIF</p>
                      </div>
                      <Input 
                        id="photos-input" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={disableSharedFields}
                      />
                    </Label>
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <Label>Novas fotos selecionadas:</Label>
                      {photos.map((photo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate">{photo.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                              onClick={() => removePhoto(index)}
                              disabled={disableSharedFields}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentation">{item ? "Adicionar Documentos" : "Documentação Técnica"}</Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="docs-input"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                        aria-disabled={disableSharedFields}
                        style={disableSharedFields ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
                      </div>
                      <Input 
                        id="docs-input" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept=".pdf,.doc,.docx,.txt"
                          onChange={handleDocumentChange}
                          disabled={disableSharedFields}
                      />
                    </Label>
                  </div>
                  {documents.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <Label>Novos documentos selecionados:</Label>
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate">{doc.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                              onClick={() => removeDocument(index)}
                              disabled={disableSharedFields}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}
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