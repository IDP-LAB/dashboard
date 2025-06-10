import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ElementType = {
  open: boolean,
  toggle: () => void
}

export const useCollapsed = create(persist<ElementType>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open }))
}), {
  name: 'is-collapsed',
  storage: createJSONStorage(() => localStorage)
}))