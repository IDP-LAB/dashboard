import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Interface para notificações do sistema
 */
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  actionUrl?: string
}

/**
 * Interface para filtros globais
 */
interface GlobalFilters {
  search: string
  category: string
  status: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: "asc" | "desc"
  page: number
  pageSize: number
}

/**
 * Interface para configurações do usuário
 */
interface UserPreferences {
  sidebarCollapsed: boolean
  dashboardWidgets: string[]
  notificationSettings: {
    lowStock: boolean
    maintenanceDue: boolean
    projectDeadlines: boolean
    systemUpdates: boolean
  }
  tablePageSize: number
  defaultView: "table" | "cards"
}

/**
 * Interface do store global da aplicação
 */
interface AppStore {
  // === NOTIFICAÇÕES ===
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void

  // === FILTROS GLOBAIS ===
  filters: GlobalFilters
  setFilter: (key: keyof GlobalFilters, value: any) => void
  resetFilters: () => void

  // === PREFERÊNCIAS DO USUÁRIO ===
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void

  // === ESTADO DA APLICAÇÃO ===
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // === DADOS EM CACHE ===
  cachedData: Record<string, any>
  setCachedData: (key: string, data: any) => void
  clearCache: () => void
}

/**
 * Filtros padrão para inicialização
 */
const defaultFilters: GlobalFilters = {
  search: "",
  category: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
}

/**
 * Preferências padrão do usuário
 */
const defaultPreferences: UserPreferences = {
  sidebarCollapsed: false,
  dashboardWidgets: ["stats", "charts", "recent-activity"],
  notificationSettings: {
    lowStock: true,
    maintenanceDue: true,
    projectDeadlines: true,
    systemUpdates: false,
  },
  tablePageSize: 10,
  defaultView: "table",
}

/**
 * Store global da aplicação usando Zustand
 * Gerencia estado global, notificações, filtros e preferências
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // === NOTIFICAÇÕES ===
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      // === FILTROS GLOBAIS ===
      filters: defaultFilters,

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: key !== "page" ? 1 : value },
        }))
      },

      resetFilters: () => {
        set({ filters: defaultFilters })
      },

      // === PREFERÊNCIAS DO USUÁRIO ===
      preferences: defaultPreferences,

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }))
      },

      // === ESTADO DA APLICAÇÃO ===
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // === DADOS EM CACHE ===
      cachedData: {},
      setCachedData: (key, data) => {
        set((state) => ({
          cachedData: { ...state.cachedData, [key]: data },
        }))
      },

      clearCache: () => set({ cachedData: {} }),
    }),
    {
      name: "maker-space-store", // Nome para localStorage
      partialize: (state) => ({
        preferences: state.preferences,
        notifications: state.notifications.slice(0, 50), // Mantém apenas 50 notificações
        unreadCount: state.unreadCount,
      }),
    },
  ),
)

/**
 * Hook para gerenciar notificações
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useAppStore()

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  }
}

/**
 * Hook para gerenciar filtros
 */
export const useFilters = () => {
  const { filters, setFilter, resetFilters } = useAppStore()

  return {
    filters,
    setFilter,
    resetFilters,
  }
}

/**
 * Hook para gerenciar preferências
 */
export const usePreferences = () => {
  const { preferences, updatePreferences } = useAppStore()

  return {
    preferences,
    updatePreferences,
  }
}
