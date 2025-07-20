/**
 * Tipos de dados para o sistema Maker Space Manager
 * Define todas as interfaces e tipos utilizados na aplicação
 */

// === TIPOS BÁSICOS ===

/** Tipos de itens disponíveis no sistema */
export type ItemType = "equipment" | "consumable"

/** Status possíveis para equipamentos */
export type EquipmentStatus = "functional" | "in_maintenance" | "out_of_use"

/** Tipos de manutenção */
export type MaintenanceType = "preventive" | "corrective"

/** Status possíveis para manutenções */
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled"

/** Status possíveis para projetos */
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled"

/** Tipos de transações de estoque */
export type TransactionType = "entry" | "exit" | "requisition"

// === INTERFACES PRINCIPAIS ===

/**
 * Interface para itens do sistema (equipamentos e insumos)
 * Contém campos específicos para cada tipo de item
 */
export interface Item {
  id: string
  name: string
  type: ItemType
  category: string
  description?: string

  // === CAMPOS ESPECÍFICOS PARA EQUIPAMENTOS ===
  serialNumber?: string // Número de série
  brand?: string // Marca/fabricante
  model?: string // Modelo específico
  acquisitionDate?: string // Data de aquisição (ISO string)
  value?: number // Valor de aquisição
  location?: string // Localização física
  status?: EquipmentStatus // Status operacional

  // === CAMPOS ESPECÍFICOS PARA INSUMOS ===
  minStockLevel?: number // Nível mínimo de estoque
  currentStock?: number // Estoque atual
  unit?: string // Unidade de medida (kg, unidade, metro, etc.)

  // === CAMPOS COMUNS ===
  imageUrl?: string // URL da imagem (futuramente array de imagens)
  documentationUrl?: string // URL da documentação (futuramente array)
  createdAt: string // Data de criação (ISO string)
  updatedAt: string // Data da última atualização (ISO string)
}

/**
 * Interface para categorias de itens
 * Permite organizar itens em grupos lógicos
 */
export interface Category {
  id: string
  name: string
}

/**
 * Interface para transações de estoque
 * Registra todas as movimentações de entrada, saída e requisições
 */
export interface StockTransaction {
  id: string
  itemId: string // ID do item movimentado
  itemName: string // Nome do item (desnormalizado para performance)
  type: TransactionType // Tipo da transação
  quantity: number // Quantidade movimentada
  reason: string // Motivo da transação
  projectId?: string // ID do projeto (opcional, para requisições)
  projectName?: string // Nome do projeto (desnormalizado)
  userId: string // ID do usuário responsável
  userName: string // Nome do usuário (desnormalizado)
  date: string // Data da transação (ISO string)
  notes?: string // Observações adicionais
}

/**
 * Interface para projetos
 * Gerencia projetos e associação com itens
 */
export interface Project {
  id: string
  name: string
  description: string
  leaderId: string // ID do líder do projeto
  leaderName: string // Nome do líder (desnormalizado)
  status: ProjectStatus
  startDate: string // Data de início (ISO string)
  endDate?: string // Data de término (ISO string, opcional)
  deadline: string // Prazo final (ISO string)
  progress: number // Progresso em porcentagem (0-100)
  budget?: number // Orçamento total
  spentBudget?: number // Orçamento já gasto
  associatedItems: ProjectItem[] // Itens associados ao projeto
  createdAt: string // Data de criação
  updatedAt: string // Data da última atualização
}

/**
 * Interface para itens associados a projetos
 * Representa a relação entre projetos e itens
 */
export interface ProjectItem {
  itemId: string
  itemName: string // Desnormalizado para performance
  itemType: ItemType
  quantityAllocated?: number // Quantidade alocada (para insumos)
  dateAllocated: string // Data de alocação
  dateReturned?: string // Data de retorno (para equipamentos)
  notes?: string // Observações sobre a alocação
}

/**
 * Interface para manutenções
 * Gerencia manutenções preventivas e corretivas
 */
export interface Maintenance {
  id: string
  equipmentId: string // ID do equipamento
  equipmentName: string // Nome do equipamento (desnormalizado)
  type: MaintenanceType
  status: MaintenanceStatus
  scheduledDate: string // Data agendada (ISO string)
  completedDate?: string // Data de conclusão (ISO string, opcional)
  description: string // Descrição do que será/foi feito
  cost?: number // Custo da manutenção
  technician?: string // Técnico responsável
  notes?: string // Observações adicionais
  nextMaintenanceDate?: string // Próxima manutenção (para preventivas)
  createdAt: string
  updatedAt: string
}

/**
 * Interface para usuários do sistema
 * Gerencia informações básicas dos usuários
 */
export interface User {
  id: string
  name: string
  email: string
  role: string // Papel no sistema (admin, user, technician, etc.)
}
