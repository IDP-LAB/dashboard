"use client"

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Download, Filter, RefreshCw, Search, LayoutGrid, Rows, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFilters } from "@/lib/store"

/**
 * Interface para configuração da tabela de dados
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  enableSearch?: boolean
  filterOptions?: {
    key: string
    label: string
    options: { label: string; value: string }[]
  }[]
  // Callback opcional para integração com filtros no servidor
  onServerFilterChange?: (filters: Record<string, string>) => void
  onExport?: () => void
  onRefresh?: () => void
  isLoading?: boolean
  title?: string
  description?: string
  serverPagination?: {
    pageIndex: number // zero-based
    pageSize: number
    total: number
    totalPages: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  // Nova funcionalidade: modos de exibição e ordenação
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  sortDirection?: 'ASC' | 'DESC'
  onSortDirectionToggle?: () => void
  // Renderização em grade
  renderGridItem?: (row: TData) => React.ReactNode
  gridColsClassName?: string
  showColumnsSelector?: boolean
}

/**
 * Componente de tabela de dados avançada com busca, filtros e paginação
 * Utiliza TanStack Table para funcionalidades avançadas
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  searchPlaceholder = "Buscar...",
  filterOptions = [],
  onExport,
  onRefresh,
  isLoading = false,
  title,
  description,
  serverPagination,
  viewMode,
  onViewModeChange,
  sortDirection,
  onSortDirectionToggle,
  renderGridItem,
  gridColsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  enableSearch = true,
  showColumnsSelector = true,
  onServerFilterChange,
}: DataTableProps<TData, TValue>) {
  // Estados locais da tabela
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Hook para filtros globais
  const { filters, setFilter } = useFilters()

  // Configuração da tabela
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(serverPagination
        ? { pagination: { pageIndex: serverPagination.pageIndex, pageSize: serverPagination.pageSize } }
        : {}),
    },
    initialState: {
      pagination: {
        pageSize: filters.pageSize,
      },
    },
    ...(serverPagination
      ? { manualPagination: true, pageCount: serverPagination.totalPages }
      : {}),
  })

  // Função para exportar dados
  const handleExport = React.useCallback(() => {
    if (onExport) {
      onExport()
    } else {
      // Exportação padrão para CSV
      const headers = columns.map((col: any) => col.header || col.accessorKey).join(",")
      const rows = table
        .getFilteredRowModel()
        .rows.map((row) =>
          columns
            .map((col: any) => {
              const value = row.getValue(col.accessorKey || col.id)
              return typeof value === "string" ? `"${value}"` : value
            })
            .join(","),
        )
        .join("\n")

      const csv = `${headers}\n${rows}`
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "dados"}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [onExport, table, columns, title])

  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}

      <CardContent>
        {/* === BARRA DE FERRAMENTAS === */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Linha superior - Busca e ações */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            {/* Busca global */}
            {enableSearch && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="pl-8"
                />
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              {/* Botão de atualizar */}
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              )}

              {/* Botão de exportar */}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              {/* Seletor de colunas */}
              {showColumnsSelector && viewMode !== 'grid' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Colunas
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Seletor Grade/Lista, se habilitado */}
              {onViewModeChange && (
                <Select value={viewMode} onValueChange={(v) => onViewModeChange(v as 'grid' | 'list')}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Visualização" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Grade
                      </div>
                    </SelectItem>
                    <SelectItem value="list">
                      <div className="flex items-center gap-2">
                        <Rows className="h-4 w-4" />
                        Lista
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Alternância de ordenação */}
              {onSortDirectionToggle && (
                <Button variant="outline" size="sm" onClick={onSortDirectionToggle} aria-label="Alternar ordenação">
                  {sortDirection === 'DESC' ? (
                    <ArrowDownWideNarrow className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowUpWideNarrow className="h-4 w-4 mr-2" />
                  )}
                  {sortDirection === 'DESC' ? 'Ordenar: Mais novo → mais antigo' : 'Ordenar: Mais antigo → mais novo'}
                </Button>
              )}
            </div>
          </div>

          {/* Linha inferior - Filtros específicos */}
          {filterOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <Select
                  key={filter.key}
                  value={(table.getColumn(filter.key)?.getFilterValue() as string) || ""}
                  onValueChange={(value) => table.getColumn(filter.key)?.setFilterValue(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>

        {/* === LISTAGEM === */}
        {viewMode === 'grid' && renderGridItem ? (
          <div className={`grid ${gridColsClassName} gap-4`}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-md border p-4">
                    <div className="h-24 bg-muted animate-pulse rounded" />
                  </div>
                ))
              : table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => (
                  <div key={row.id}>{renderGridItem(row.original as TData)}</div>
                ))
              : (
                <div className="col-span-full">
                  <div className="flex flex-col items-center gap-2 border rounded-md py-12">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="whitespace-nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {columns.map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <div className="h-4 bg-muted animate-pulse rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table
                      .getRowModel()
                      .rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* === PAGINAÇÃO === */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          {/* Informações da seleção */}
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s)
                selecionada(s).
              </span>
            )}
          </div>

          {/* Controles de paginação */}
          <div className="flex items-center gap-2">
            {/* Seletor de itens por página */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <Select
                value={`${(serverPagination ? serverPagination.pageSize : table.getState().pagination.pageSize)}`}
                onValueChange={(value) => {
                  const size = Number(value)
                  if (serverPagination) {
                    // Em paginação no servidor, resetamos a página para 0 ao mudar o tamanho
                    serverPagination.onPageSizeChange(size)
                    serverPagination.onPageChange(0)
                  } else {
                    table.setPageSize(size)
                  }
                  setFilter("pageSize", size)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={(serverPagination ? serverPagination.pageSize : table.getState().pagination.pageSize)} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Informações da página */}
            <div className="flex w-[140px] items-center justify-center text-sm font-medium">
              {serverPagination
                ? <>Página {serverPagination.pageIndex + 1} de {serverPagination.totalPages}</>
                : <>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</>}
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => (serverPagination ? serverPagination.onPageChange(0) : table.setPageIndex(0))}
                disabled={serverPagination ? serverPagination.pageIndex <= 0 : !table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                {"<<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => (serverPagination ? serverPagination.onPageChange(Math.max(0, serverPagination.pageIndex - 1)) : table.previousPage())}
                disabled={serverPagination ? serverPagination.pageIndex <= 0 : !table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                {"<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => (serverPagination ? serverPagination.onPageChange(Math.min(serverPagination.totalPages - 1, serverPagination.pageIndex + 1)) : table.nextPage())}
                disabled={serverPagination ? serverPagination.pageIndex >= serverPagination.totalPages - 1 : !table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                {">"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => (serverPagination ? serverPagination.onPageChange(serverPagination.totalPages - 1) : table.setPageIndex(table.getPageCount() - 1))}
                disabled={serverPagination ? serverPagination.pageIndex >= serverPagination.totalPages - 1 : !table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                {">>"}
              </Button>
            </div>
          </div>
        </div>

        {/* === INFORMAÇÕES ADICIONAIS === */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div>
            {serverPagination
              ? <>Mostrando página {serverPagination.pageIndex + 1} de {serverPagination.totalPages} • Total: {serverPagination.total} registros{globalFilter && ` para "${globalFilter}"`}</>
              : <>Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} resultados{globalFilter && ` para "${globalFilter}"`}</>}
          </div>
          <div className="flex items-center gap-4">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Badge variant="secondary">{table.getFilteredSelectedRowModel().rows.length} selecionados</Badge>
            )}
            <span>Total: {serverPagination ? serverPagination.total : data.length} registros</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
