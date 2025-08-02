
/**
 * Dados mockados para desenvolvimento e testes
 * Em produção, estes dados virão de um banco de dados
 */

/**
 * Categorias de itens disponíveis no sistema
 * Organizam os itens em grupos lógicos para facilitar a navegação
 */
export const mockCategories = [
  { id: 1, name: "Impressão 3D" },
  { id: 2, name: "Eletrônica" },
  { id: 3, name: "Mecânica CNC" },
  { id: 4, name: "Ferramentas Manuais" },
  { id: 5, name: "Materiais Diversos" },
]

/**
 * Usuários do sistema com diferentes papéis
 * Inclui administradores, usuários comuns e técnicos
 */
export const mockUsers = [
  { id: 1, name: "João Silva", email: "joao@makerspace.com", role: "admin" },
  { id: 2, name: "Maria Santos", email: "maria@makerspace.com", role: "user" },
  { id: 3, name: "Pedro Costa", email: "pedro@makerspace.com", role: "user" },
  { id: 4, name: "Ana Oliveira", email: "ana@makerspace.com", role: "user" },
  { id: 5, name: "Carlos Lima", email: "carlos@makerspace.com", role: "technician" },
]

/**
 * Itens do sistema (equipamentos e insumos)
 * Mistura de equipamentos permanentes e materiais consumíveis
 */
export const mockItems: Item[] = [
  {
    id: "item1",
    name: "Impressora 3D Ender 3",
    type: "equipment",
    category: "Impressão 3D",
    serialNumber: "SN12345",
    brand: "Creality",
    model: "Ender 3 V2",
    acquisitionDate: "2023-01-15",
    value: 300,
    location: "Bancada A1",
    status: "functional",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item2",
    name: "Filamento PLA Branco 1kg",
    type: "consumable",
    category: "Impressão 3D",
    minStockLevel: 5,
    currentStock: 10,
    unit: "kg",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item3",
    name: "Arduino Uno R3",
    type: "equipment",
    category: "Eletrônica",
    brand: "Arduino",
    model: "Uno R3",
    status: "functional",
    location: "Caixa E2",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item4",
    name: "Kit de Parafusos M3",
    type: "consumable",
    category: "Mecânica CNC",
    minStockLevel: 1,
    currentStock: 3,
    unit: "kit",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item5",
    name: "Fresadora CNC 3018",
    type: "equipment",
    category: "Mecânica CNC",
    serialNumber: "CNCX987",
    brand: "Genmitsu",
    model: "3018-PROVer",
    status: "in_maintenance",
    location: "Bancada B2",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item6",
    name: "Resistores 220Ω",
    type: "consumable",
    category: "Eletrônica",
    minStockLevel: 50,
    currentStock: 120,
    unit: "unidade",
    imageUrl: "/placeholder.svg?width=64&height=64",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Transações de estoque para demonstrar o histórico de movimentações
 * Inclui entradas, saídas e requisições para projetos
 */
export const mockStockTransactions: StockTransaction[] = [
  {
    id: "trans1",
    itemId: "item2",
    itemName: "Filamento PLA Branco 1kg",
    type: "entry",
    quantity: 5,
    reason: "Compra mensal",
    userId: "user1",
    userName: "João Silva",
    date: "2024-01-10",
    notes: "Fornecedor XYZ",
  },
  {
    id: "trans2",
    itemId: "item2",
    itemName: "Filamento PLA Branco 1kg",
    type: "requisition",
    quantity: 2,
    reason: "Projeto Robô",
    projectId: "proj1",
    projectName: "Robô Seguidor de Linha",
    userId: "user2",
    userName: "Maria Santos",
    date: "2024-01-12",
  },
  {
    id: "trans3",
    itemId: "item4",
    itemName: "Kit de Parafusos M3",
    type: "exit",
    quantity: 1,
    reason: "Manutenção equipamento",
    userId: "user5",
    userName: "Carlos Lima",
    date: "2024-01-08",
  },
]

/**
 * Projetos ativos e concluídos no Maker Space
 * Demonstra diferentes estágios e tipos de projetos
 */
export const mockProjects: Project[] = [
  {
    id: "proj1",
    name: "Robô Seguidor de Linha",
    description: "Desenvolvimento de um robô autônomo capaz de seguir linhas usando sensores infravermelhos.",
    leaderId: "user2",
    leaderName: "Maria Santos",
    status: "active",
    startDate: "2024-01-01",
    deadline: "2024-02-15",
    progress: 75,
    budget: 500,
    spentBudget: 320,
    associatedItems: [
      {
        itemId: "item3",
        itemName: "Arduino Uno R3",
        itemType: "equipment",
        dateAllocated: "2024-01-01",
        notes: "Controlador principal",
      },
      {
        itemId: "item2",
        itemName: "Filamento PLA Branco 1kg",
        itemType: "consumable",
        quantityAllocated: 2,
        dateAllocated: "2024-01-05",
        notes: "Para chassis do robô",
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "proj2",
    name: "Sistema IoT para Plantas",
    description: "Sistema de monitoramento automático de plantas com sensores de umidade e temperatura.",
    leaderId: "user3",
    leaderName: "Pedro Costa",
    status: "active",
    startDate: "2024-01-15",
    deadline: "2024-03-01",
    progress: 45,
    budget: 800,
    spentBudget: 180,
    associatedItems: [
      {
        itemId: "item6",
        itemName: "Resistores 220Ω",
        itemType: "consumable",
        quantityAllocated: 10,
        dateAllocated: "2024-01-15",
      },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "proj3",
    name: "Impressora 3D Customizada",
    description: "Modificação e melhoria de impressora 3D existente para maior precisão.",
    leaderId: "user4",
    leaderName: "Ana Oliveira",
    status: "active",
    startDate: "2023-12-01",
    deadline: "2024-01-30",
    progress: 90,
    budget: 1200,
    spentBudget: 1050,
    associatedItems: [
      {
        itemId: "item1",
        itemName: "Impressora 3D Ender 3",
        itemType: "equipment",
        dateAllocated: "2023-12-01",
        notes: "Base para modificações",
      },
    ],
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
]

/**
 * Manutenções programadas e realizadas
 * Inclui manutenções preventivas e corretivas em diferentes status
 */
export const mockMaintenances: Maintenance[] = [
  {
    id: "maint1",
    equipmentId: "item1",
    equipmentName: "Impressora 3D Ender 3",
    type: "preventive",
    status: "scheduled",
    scheduledDate: "2024-01-25",
    description: "Limpeza e calibração mensal",
    technician: "Carlos Lima",
    nextMaintenanceDate: "2024-02-25",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "maint2",
    equipmentId: "item5",
    equipmentName: "Fresadora CNC 3018",
    type: "corrective",
    status: "in_progress",
    scheduledDate: "2024-01-15",
    description: "Substituição de motor do eixo X",
    cost: 150,
    technician: "Carlos Lima",
    notes: "Motor apresentou ruído excessivo",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "maint3",
    equipmentId: "item3",
    equipmentName: "Arduino Uno R3",
    type: "preventive",
    status: "completed",
    scheduledDate: "2024-01-05",
    completedDate: "2024-01-05",
    description: "Verificação de conectores e limpeza",
    cost: 0,
    technician: "Carlos Lima",
    nextMaintenanceDate: "2024-04-05",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
]
