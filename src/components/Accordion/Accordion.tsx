'use client'

import { ReactNode, useMemo, useState } from 'react'
import {
  AccordionContext,
  AccordionItemContext,
  HeadingLevel,
  useAccordionContext,
  useAccordionItemContext,
} from './AccordionContext'

type AccordionProps = {
  headingLevel?: HeadingLevel // default 3
  children: ReactNode
} & (
  | {
      type: 'single'
      defaultValue?: string
      value?: string
      onValueChange?: (value: string | null) => void
    }
  | {
      type: 'multiple'
      defaultValue?: string[]
      value?: string[]
      onValueChange?: (value: string[]) => void
    }
)

function AccordionRoot({
  type,
  defaultValue,
  value,
  onValueChange,
  headingLevel = 3,
  children,
}: AccordionProps) {
  const [internalValues, setInternalValues] = useState(() =>
    resolveInternalValues(type, defaultValue)
  )
  const isControlled = value !== undefined
  const openValues = useMemo(
    () => (isControlled ? resolveInternalValues(type, value) : internalValues),
    [internalValues, isControlled, type, value]
  )
  const toggle = (itemValue: string) => {
    const newValue = toggleItemValue(type, itemValue, openValues)

    if (!isControlled) {
      setInternalValues(newValue)
    }
    if (type === 'single') {
      onValueChange?.(newValue[0] ?? null)
    } else {
      onValueChange?.(newValue)
    }
  }

  return (
    <AccordionContext.Provider value={{ headingLevel, openValues, toggle }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  )
}

function resolveInternalValues(accordionType: AccordionProps['type'], value?: string | string[]) {
  if (value === undefined) {
    return []
  }
  switch (accordionType) {
    case 'single':
      if (typeof value !== 'string') {
        throw new Error('Single accordion type expects string value')
      }
      return [value]
    case 'multiple':
      if (!Array.isArray(value)) {
        throw new Error('Multiple accordion type expects array value')
      }
      return value
    default:
      accordionType satisfies never
      return []
  }
}

function toggleItemValue(
  accordionType: AccordionProps['type'],
  itemValue: string,
  openValues: string[]
) {
  switch (accordionType) {
    case 'single':
      return openValues.includes(itemValue) ? [] : [itemValue]
    case 'multiple':
      return openValues.includes(itemValue)
        ? openValues.filter((value) => value !== itemValue)
        : [...openValues, itemValue]
    default:
      accordionType satisfies never
      return []
  }
}

interface AccordionItemProps {
  value: string
  children: ReactNode
}

function AccordionItem({ value, children }: AccordionItemProps) {
  const accordion = useAccordionContext()
  const isOpen = accordion.openValues.includes(value)

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div>{children}</div>
    </AccordionItemContext.Provider>
  )
}

function AccordionTrigger({ children }: { children: ReactNode }) {
  const accordion = useAccordionContext()
  const item = useAccordionItemContext()
  const Heading = `h${accordion.headingLevel}` as const
  const contentId = `accordion-content-${item.value}`
  const triggerId = `accordion-trigger-${item.value}`

  const handleToggle = () => accordion.toggle(item.value)

  return (
    <Heading>
      <button
        id={triggerId}
        type="button"
        onClick={handleToggle}
        aria-expanded={item.isOpen}
        aria-controls={contentId}
      >
        {children}
      </button>
    </Heading>
  )
}

function AccordionContent({ children }: { children: ReactNode }) {
  const item = useAccordionItemContext()
  const contentId = `accordion-content-${item.value}`
  const triggerId = `accordion-trigger-${item.value}`

  if (!item.isOpen) return null

  return (
    <div id={contentId} role="region" aria-labelledby={triggerId}>
      {children}
    </div>
  )
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})
