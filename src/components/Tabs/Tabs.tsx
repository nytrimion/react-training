'use client'

import { KeyboardEvent, ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'
import { ActivationMode, TabsContext, useTabsContext } from './TabsContext'

// Tabs Root

interface TabsProps {
  activationMode?: ActivationMode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function TabsRoot({
  activationMode = 'auto',
  defaultValue,
  value,
  onValueChange,
  children,
}: TabsProps) {
  const scope = useId()
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null)
  const isControlled = value !== undefined
  const openValue = isControlled ? value : internalValue

  const open = (tabValue: string) => {
    if (tabValue === openValue) {
      return
    }
    if (!isControlled) {
      setInternalValue(tabValue)
    }
    onValueChange?.(tabValue)
  }

  return (
    <TabsContext.Provider value={{ scope, activationMode, openValue, open }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

// Tabs List

interface TabsListProps {
  children: ReactNode
}

export function TabsList({ children }: TabsListProps) {
  const { activationMode, openValue, open } = useTabsContext()
  const openRef = useRef(open)
  const tabList = useRef<HTMLDivElement | null>(null)

  const getTabs = () =>
    tabList.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      ?.values()
      .toArray() ?? []

  const openFocused = () => {
    const value = getTabs().find((tab) => tab === document.activeElement)?.dataset.value
    if (value === undefined) return
    openRef.current(value)
  }

  const focusIndex = (index: number) => {
    getTabs().at(index)?.focus()
    if (activationMode === 'auto') openFocused()
  }

  type TabDirection = 'previous' | 'next'

  const findAdjacent = (direction: TabDirection) => {
    const tabs = direction === 'previous' ? getTabs() : getTabs().toReversed()
    if (tabs.length === 0) return

    let previous = tabs.at(-1)
    for (const tab of tabs) {
      if (tab === document.activeElement) return previous
      previous = tab
    }
    return undefined
  }

  const focusAdjacent = (direction: TabDirection) => {
    findAdjacent(direction)?.focus()
    if (activationMode === 'auto') openFocused()
  }

  // noinspection JSUnusedGlobalSymbols
  const ACTION_KEYMAP: Record<string, () => void> = {
    ' ': openFocused,
    Enter: openFocused,
    Home: () => focusIndex(0),
    End: () => focusIndex(-1),
    ArrowLeft: () => focusAdjacent('previous'),
    ArrowRight: () => focusAdjacent('next'),
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const action = ACTION_KEYMAP[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  useLayoutEffect(() => {
    openRef.current = open
  })

  useLayoutEffect(() => {
    const tabs = getTabs()
    // Ensures at least one tab is open after mount or children change.
    if (tabs.some((tab) => tab.dataset.value === openValue)) return
    // Open first tab as default.
    const value = tabs.at(0)?.dataset.value
    if (value !== undefined) openRef.current(value)
  }, [children, openValue])

  return (
    <div ref={tabList} role="tablist" onKeyDown={handleKeyDown}>
      {children}
    </div>
  )
}

// Tab

interface TabsTabProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

export function TabsTab({ value, disabled, children }: TabsTabProps) {
  const { scope, openValue, open } = useTabsContext()
  const isOpen = value === openValue && !disabled
  const { tabId, panelId } = formatTabIdentifiers(scope, value)

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      data-value={value}
      onClick={() => open(value)}
      disabled={disabled}
      tabIndex={isOpen ? 0 : -1}
      aria-selected={isOpen}
      aria-controls={panelId}
      className={`mr-2 border-b-blue-700 ${isOpen ? 'border-b-2' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      {children}
    </button>
  )
}

// Tab Panel

interface TabsPanelProps {
  value: string
  children: ReactNode
}

export function TabsPanel({ value, children }: TabsPanelProps) {
  const { scope, openValue } = useTabsContext()
  const isOpen = value === openValue
  const { tabId, panelId } = formatTabIdentifiers(scope, value)

  return (
    <div id={panelId} role="tabpanel" hidden={!isOpen} aria-labelledby={tabId}>
      {children}
    </div>
  )
}

// Helpers

function formatTabIdentifiers(scope: string, value: string) {
  const tabId = `tabs-${scope}-tab-${value}`
  const panelId = `tabs-${scope}-panel-${value}`

  return { tabId, panelId }
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
})
