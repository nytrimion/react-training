'use client'

import { Tabs } from '@/components/Tabs'

export default function TabsPage() {
  return (
    <>
      <h1>Tabs Demo</h1>
      <Tabs defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
          <Tabs.Tab value="tab-3" disabled>
            Tab 3
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tab-1">Content 1</Tabs.Panel>
        <Tabs.Panel value="tab-2">Content 2</Tabs.Panel>
        <Tabs.Panel value="tab-3">Content 3</Tabs.Panel>
      </Tabs>
    </>
  )
}
