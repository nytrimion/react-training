'use client'

import { Accordion } from '@/components/Accordion'

export default function AccordionPage() {
  return (
    <>
      <h1>Accordion Demo</h1>
      <h2>Single mode</h2>
      <Accordion type="single" headingLevel={3} defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Content of section 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>Content of section 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <hr className="my-2" />
      <h2>Multiple mode</h2>
      <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Content of section 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>Content of section 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </>
  )
}
