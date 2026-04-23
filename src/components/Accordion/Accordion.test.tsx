import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from './Accordion'
import { HeadingLevel } from './AccordionContext'

describe('Accordion', () => {
  type AccordionProps = {
    headingLevel?: HeadingLevel
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

  function renderAccordion(props: AccordionProps) {
    return render(
      <Accordion {...props}>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Content of section 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>Content of section 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
  }

  describe('single mode', () => {
    it('renders with no default open items', () => {
      renderAccordion({ type: 'single' })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('renders with default open item', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('opens closed item when trigger is clicked', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'single' })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
    })

    it('closes open item when trigger is clicked', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
    })

    it('closes item when the other opens', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 2/i })).toBeInTheDocument()
    })
  })

  describe('multiple mode', () => {
    it('renders with no default open items', () => {
      renderAccordion({ type: 'multiple' })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('renders with multiple default open items', () => {
      renderAccordion({ type: 'multiple', defaultValue: ['item-1'] })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('opens closed item when trigger is clicked', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'multiple' })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
    })

    it('closes open item when trigger is clicked', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'multiple', defaultValue: ['item-1'] })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
    })

    it('keeps item open when the other opens', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'multiple', defaultValue: ['item-1'] })

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 2/i })).toBeInTheDocument()
    })
  })

  describe('onValueChange callback', () => {
    it('calls onValueChange on open in single mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderAccordion({ type: 'single', onValueChange })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(onValueChange).toHaveBeenCalledWith('item-1')
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it('calls onValueChange on close in single mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderAccordion({ type: 'single', defaultValue: 'item-1', onValueChange })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(onValueChange).toHaveBeenCalledWith(null)
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it('calls onValueChange on open in multiple mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderAccordion({ type: 'multiple', onValueChange })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(onValueChange).toHaveBeenCalledWith(['item-1'])

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(onValueChange).toHaveBeenCalledWith(['item-1', 'item-2'])
      expect(onValueChange).toHaveBeenCalledTimes(2)
    })

    it('calls onValueChange on close in multiple mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderAccordion({ type: 'multiple', defaultValue: ['item-1', 'item-2'], onValueChange })

      await user.click(screen.getByRole('button', { name: /section 1/i }))

      expect(onValueChange).toHaveBeenCalledWith(['item-2'])

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(onValueChange).toHaveBeenCalledWith([])
      expect(onValueChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('controlled mode', () => {
    it('reflects value prop in single mode', () => {
      renderAccordion({ type: 'single', value: 'item-1' })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('reflects value prop in multiple mode', () => {
      renderAccordion({ type: 'multiple', value: ['item-1'] })

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /section 2/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('ignores defaultValue when value is provided in single mode', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1', value: 'item-2' })

      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 2/i })).toBeInTheDocument()
    })

    it('ignores defaultValue when value is provided in multiple mode', () => {
      renderAccordion({ type: 'multiple', defaultValue: ['item-1'], value: ['item-2'] })

      expect(screen.queryByRole('region', { name: /section 1/i })).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: /section 2/i })).toBeInTheDocument()
    })

    it('does not update display when trigger is clicked in single mode', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'single', value: 'item-1' })

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })

    it('does not update display when trigger is clicked in multiple mode', async () => {
      const user = userEvent.setup()

      renderAccordion({ type: 'multiple', value: ['item-1'] })

      await user.click(screen.getByRole('button', { name: /section 2/i }))

      expect(screen.getByRole('region', { name: /section 1/i })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: /section 2/i })).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('reflects open state with aria-expanded', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })

    it('links trigger to content with aria-controls', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
        'aria-controls',
        'accordion-content-item-1'
      )
    })

    it('sets aria-labelledby on content', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1' })

      expect(screen.getByRole('region', { name: /section 1/i })).toHaveAttribute(
        'aria-labelledby',
        'accordion-trigger-item-1'
      )
    })

    it('sets button type on trigger', () => {
      renderAccordion({ type: 'single' })

      expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute('type', 'button')
    })

    it('renders correct element with default heading level', () => {
      renderAccordion({ type: 'single' })

      expect(screen.getByRole('heading', { name: /section 1/i }).tagName).toBe('H3')
    })

    it.each([1, 2, 3, 4, 5, 6] as const)(
      'renders correct element h%i with heading level prop',
      (level) => {
        renderAccordion({ type: 'single', headingLevel: level })

        expect(screen.getByRole('heading', { name: /section 1/i }).tagName).toBe(`H${level}`)
      }
    )
  })

  describe('error handling', () => {
    let errorSpy: jest.SpyInstance

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('throws error when item is outside of accordion', () => {
      const ui = <Accordion.Item value="whatever">Children</Accordion.Item>

      expect(() => render(ui)).toThrow(
        'Accordion compound components must be used within <Accordion>'
      )
    })

    it('throws error when trigger is outside of accordion', () => {
      const ui = <Accordion.Trigger>Children</Accordion.Trigger>

      expect(() => render(ui)).toThrow(
        'Accordion compound components must be used within <Accordion>'
      )
    })

    it('throws error when trigger is outside of accordion item', () => {
      const ui = (
        <Accordion type="single">
          <Accordion.Trigger>Children</Accordion.Trigger>
        </Accordion>
      )

      expect(() => render(ui)).toThrow(
        'Accordion.Trigger/Content must be used within <Accordion.Item>'
      )
    })

    it('throws error when content is outside of accordion item', () => {
      const ui = <Accordion.Content>Children</Accordion.Content>

      expect(() => render(ui)).toThrow(
        'Accordion.Trigger/Content must be used within <Accordion.Item>'
      )
    })
  })
})
