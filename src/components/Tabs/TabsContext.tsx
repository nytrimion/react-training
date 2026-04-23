import { createContext, useContext } from 'react'

export type ActivationMode = 'auto' | 'manual'

interface TabsContextType {
  scope: string
  activationMode: ActivationMode
  openValue: string | null
  open: (tabValue: string) => void
}

export const TabsContext = createContext<TabsContextType | null>(null)

export function useTabsContext(): TabsContextType {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return context
}
