"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronsUpDown, Plus, X as CloseIcon } from "lucide-react"
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

export interface TagOption {
  id: number
  name: string
}

interface TagMultiComboboxProps {
  values?: TagOption[]
  onValuesChange: (tags: TagOption[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagMultiCombobox({
  values = [],
  onValuesChange,
  placeholder = "Selecione ou digite tags...",
  className,
  disabled = false,
}: TagMultiComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const { client } = useAPI()

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await client.query("/tag", "get")
      if (!isSuccessResponse(response)) return []
      return response.data as TagOption[]
    },
  })

  const allTags = tagsData || []

  const filteredTags = useMemo(() => {
    const v = inputValue.toLowerCase()
    return allTags.filter(t => t.name.toLowerCase().includes(v))
  }, [allTags, inputValue])

  const exactMatch = useMemo(() => {
    const v = inputValue.trim().toLowerCase()
    return allTags.find(t => t.name.toLowerCase() === v)
  }, [allTags, inputValue])

  const toggleTag = (tag: TagOption) => {
    const exists = values.some(v => v.id === tag.id)
    if (exists) {
      onValuesChange(values.filter(v => v.id !== tag.id))
    } else {
      onValuesChange([...values, tag])
    }
  }

  const removeTag = (tagId: number) => {
    onValuesChange(values.filter(v => v.id !== tagId))
  }

  const createTempTag = (name: string): TagOption => ({ id: -1, name: name.trim() })

  const handleCreateNew = () => {
    if (inputValue.trim() && !exactMatch) {
      const newTag = createTempTag(inputValue)
      onValuesChange([...values, newTag])
      setInputValue("")
      setOpen(false)
    }
  }

  useEffect(() => {
    // close popover when disabled
    if (disabled) setOpen(false)
  }, [disabled])

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
          {values.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 text-left">
              {values.map((tag) => (
                <span
                  key={`${tag.id}-${tag.name}`}
                  className="inline-flex items-center gap-1 max-w-full truncate rounded border px-2 py-0.5 text-xs"
                >
                  <span className="truncate">{tag.name}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${tag.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeTag(tag.id)
                    }}
                    className="opacity-60 hover:opacity-100"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Digite para buscar ou criar tag..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 p-4">
                  <p className="text-sm text-muted-foreground">Nenhuma tag encontrada.</p>
                  {inputValue.trim() && (
                    <Button size="sm" onClick={handleCreateNew} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar "{inputValue.trim()}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>

              {filteredTags.length > 0 && (
                <CommandGroup heading="Tags existentes">
                  {filteredTags.map((tag) => (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => toggleTag(tag)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          values.some(v => v.id === tag.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {inputValue.trim() && !exactMatch && filteredTags.length > 0 && (
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


