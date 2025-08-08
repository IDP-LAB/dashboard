import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { useAPI } from "@/hooks/useAPI"
import { isSuccessResponse } from "@/lib/response"

interface Category {
  id: number
  name: string
}

interface CategoryComboboxProps {
  value?: Category
  onValueChange: (category: Category) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CategoryCombobox({
  value,
  onValueChange,
  placeholder = "Selecione ou digite uma categoria...",
  className,
  disabled = false
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const { client } = useAPI()

  // Query para buscar categorias
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await client.query("/category", "get", undefined)
      if (!isSuccessResponse(response)) return []
      return response.data as Category[]
    }
  })

  const categories = categoriesData || []

  // Filtrar categorias baseado no input
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Verificar se a categoria digitada já existe
  const exactMatch = categories.find(
    category => category.name.toLowerCase() === inputValue.toLowerCase()
  )

  // Função para criar nova categoria (será chamada apenas no submit do formulário)
  const createCategoryData = (name: string): Category => {
    // Retorna um objeto temporário que será usado para criar a categoria no submit
    return {
      id: -1, // ID temporário
      name: name.trim()
    }
  }

  const handleSelect = (category: Category) => {
    onValueChange(category)
    setOpen(false)
    setInputValue("")
  }

  const handleCreateNew = () => {
    if (inputValue.trim() && !exactMatch) {
      const newCategory = createCategoryData(inputValue)
      onValueChange(newCategory)
      setOpen(false)
      setInputValue("")
    }
  }

  // Atualizar o input quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setInputValue("")
    }
  }, [value])

  return (
    <Popover open={!disabled && open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {value ? value.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Digite para buscar ou criar categoria..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 p-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria encontrada.
                </p>
                {inputValue.trim() && (
                  <Button
                    size="sm"
                    onClick={handleCreateNew}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar "{inputValue.trim()}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            
            {filteredCategories.length > 0 && (
              <CommandGroup heading="Categorias existentes">
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => handleSelect(category)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Opção para criar nova categoria se não existir */}
            {inputValue.trim() && !exactMatch && filteredCategories.length > 0 && (
              <CommandGroup heading="Criar nova">
                <CommandItem onSelect={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar "{inputValue.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        </PopoverContent>
      )}
    </Popover>
  )
} 