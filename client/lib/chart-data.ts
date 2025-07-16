// Dados mocados para os gráficos do sistema com cores acessíveis

/**
 * Dados de uso de equipamentos por mês
 * Utiliza cores com boa acessibilidade e contraste
 */
export const equipmentUsageData = [
  { month: "Jan", impressora3D: 45, fresadoraCNC: 23, arduino: 67, ferramentas: 34 },
  { month: "Fev", impressora3D: 52, fresadoraCNC: 28, arduino: 73, ferramentas: 41 },
  { month: "Mar", impressora3D: 48, fresadoraCNC: 31, arduino: 69, ferramentas: 38 },
  { month: "Abr", impressora3D: 61, fresadoraCNC: 35, arduino: 82, ferramentas: 45 },
  { month: "Mai", impressora3D: 55, fresadoraCNC: 29, arduino: 76, ferramentas: 42 },
  { month: "Jun", impressora3D: 67, fresadoraCNC: 38, arduino: 89, ferramentas: 51 },
]

/**
 * Dados de consumo de materiais
 */
export const materialConsumptionData = [
  { month: "Jan", filamentoPLA: 12, filamentoABS: 8, placasPCB: 25, parafusos: 150 },
  { month: "Fev", filamentoPLA: 15, filamentoABS: 10, placasPCB: 32, parafusos: 180 },
  { month: "Mar", filamentoPLA: 18, filamentoABS: 12, placasPCB: 28, parafusos: 165 },
  { month: "Abr", filamentoPLA: 22, filamentoABS: 14, placasPCB: 35, parafusos: 200 },
  { month: "Mai", filamentoPLA: 19, filamentoABS: 11, placasPCB: 30, parafusos: 175 },
  { month: "Jun", filamentoPLA: 25, filamentoABS: 16, placasPCB: 42, parafusos: 220 },
]

/**
 * Dados de manutenção com custos
 */
export const maintenanceData = [
  { month: "Jan", preventiva: 8, corretiva: 3, custo: 1200 },
  { month: "Fev", preventiva: 6, corretiva: 5, custo: 1800 },
  { month: "Mar", preventiva: 9, corretiva: 2, custo: 950 },
  { month: "Abr", preventiva: 7, corretiva: 4, custo: 1500 },
  { month: "Mai", preventiva: 10, corretiva: 1, custo: 800 },
  { month: "Jun", preventiva: 8, corretiva: 6, custo: 2100 },
]

/**
 * Distribuição por categoria com cores acessíveis
 * Cores escolhidas para máximo contraste e acessibilidade
 */
export const categoryDistributionData = [
  { name: "Impressão 3D", value: 35, color: "hsl(213, 96%, 40%)" }, // Azul primário
  { name: "Eletrônica", value: 28, color: "hsl(75, 100%, 68%)" }, // Verde lima
  { name: "Mecânica CNC", value: 20, color: "hsl(25, 95%, 53%)" }, // Laranja
  { name: "Ferramentas", value: 17, color: "hsl(340, 75%, 55%)" }, // Rosa
]

/**
 * Níveis de estoque atual vs mínimo/máximo
 */
export const stockLevelsData = [
  { item: "Filamento PLA", atual: 15, minimo: 5, maximo: 25 },
  { item: "Filamento ABS", atual: 8, minimo: 3, maximo: 15 },
  { item: "Placas PCB", atual: 45, minimo: 20, maximo: 60 },
  { item: "Parafusos M3", atual: 3, minimo: 5, maximo: 20 },
  { item: "Resistores", atual: 120, minimo: 50, maximo: 200 },
  { item: "LEDs", atual: 85, minimo: 30, maximo: 150 },
]

/**
 * Timeline de projetos
 */
export const projectsTimelineData = [
  { month: "Jan", ativos: 8, concluidos: 3, planejados: 2 },
  { month: "Fev", ativos: 10, concluidos: 5, planejados: 3 },
  { month: "Mar", ativos: 12, concluidos: 4, planejados: 4 },
  { month: "Abr", ativos: 15, concluidos: 7, planejados: 2 },
  { month: "Mai", ativos: 13, concluidos: 6, planejados: 5 },
  { month: "Jun", ativos: 16, concluidos: 8, planejados: 3 },
]

/**
 * Status dos equipamentos com cores acessíveis
 */
export const equipmentStatusData = [
  { name: "Funcional", value: 85, color: "hsl(142, 76%, 36%)" }, // Verde
  { name: "Em Manutenção", value: 10, color: "hsl(45, 93%, 47%)" }, // Amarelo
  { name: "Fora de Uso", value: 5, color: "hsl(0, 65%, 51%)" }, // Vermelho
]

/**
 * Atividade dos usuários
 */
export const userActivityData = [
  { user: "João Silva", horas: 45, projetos: 3 },
  { user: "Maria Santos", horas: 38, projetos: 2 },
  { user: "Pedro Costa", horas: 52, projetos: 4 },
  { user: "Ana Oliveira", horas: 29, projetos: 2 },
  { user: "Carlos Lima", horas: 41, projetos: 3 },
]

/**
 * Análise de custos vs orçamento
 */
export const costAnalysisData = [
  { category: "Manutenção", valor: 8500, orcamento: 10000 },
  { category: "Materiais", valor: 12300, orcamento: 15000 },
  { category: "Equipamentos", valor: 25000, orcamento: 30000 },
  { category: "Energia", valor: 3200, orcamento: 4000 },
]
