import { createContext, useContext } from 'react'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

interface AccordionContextType {
  headingLevel: HeadingLevel
  openValues: string[]
  toggle: (itemValue: string) => void
}

interface AccordionItemContextType {
  value: string
  isOpen: boolean
}

export const AccordionContext = createContext<AccordionContextType | null>(null)
export const AccordionItemContext = createContext<AccordionItemContextType | null>(null)

export function useAccordionContext(): AccordionContextType {
  const context = useContext(AccordionContext)

  if (!context) {
    throw new Error('Accordion compound components must be used within <Accordion>')
  }
  return context
}

export function useAccordionItemContext(): AccordionItemContextType {
  const context = useContext(AccordionItemContext)

  if (!context) {
    throw new Error('Accordion.Trigger/Content must be used within <Accordion.Item>')
  }
  return context
}
