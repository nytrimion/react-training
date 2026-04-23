import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'
import { ActivationMode } from './TabsContext'

describe('Tabs', () => {
  interface TabsProps {
    activationMode?: ActivationMode
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
  }

  function renderTabs(props: TabsProps = {}) {
    return render(
      <Tabs {...props}>
        <Tabs.List>
          <Tabs.Tab value="tab-1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
          <Tabs.Tab value="tab-3" disabled>
            Tab 3
          </Tabs.Tab>
          <Tabs.Tab value="tab-4">Tab 4</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab-1">Content 1</Tabs.Panel>
        <Tabs.Panel value="tab-2">Content 2</Tabs.Panel>
        <Tabs.Panel value="tab-3">Content 3</Tabs.Panel>
        <Tabs.Panel value="tab-4">Content 4</Tabs.Panel>
      </Tabs>
    )
  }

  describe('default rendering', () => {
    it('auto-selects first non-disabled tab when no defaultValue is given', () => {
      renderTabs()

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 1/i })).toBeVisible()
    })

    it('selects the tab specified by defaultValue', () => {
      renderTabs({ defaultValue: 'tab-2' })

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 2/i })).toBeVisible()
    })

    it('shows only the selected panel', () => {
      renderTabs({ defaultValue: 'tab-1' })

      expect(screen.getByRole('tabpanel', { name: /tab 1/i })).toBeVisible()
      expect(screen.queryByRole('tabpanel', { name: /tab 2/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('tabpanel', { name: /tab 4/i })).not.toBeInTheDocument()
    })

    it('rebases to first tab when defaultValue references a disabled tab', () => {
      renderTabs({ defaultValue: 'tab-3' })

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
    })

    it('rebases to first tab when defaultValue is unknown', () => {
      renderTabs({ defaultValue: 'unknown' })

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('mouse interaction', () => {
    it('activates a tab when clicked', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-1' })

      await user.click(screen.getByRole('tab', { name: /tab 2/i }))

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 2/i })).toBeVisible()
    })

    it('does not activate a disabled tab when clicked', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-1' })

      await user.click(screen.getByRole('tab', { name: /tab 3/i }))

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('keyboard navigation (auto mode)', () => {
    it('focuses and activates the next tab when ArrowRight key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveFocus()
      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
    })

    it('focuses and activates the previous tab when ArrowLeft key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-2' })

      await user.tab()
      await user.keyboard('{ArrowLeft}')

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveFocus()
      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
    })

    it.each([
      { key: 'ArrowLeft', from: 'tab-4', to: 'tab 2' },
      { key: 'ArrowRight', from: 'tab-2', to: 'tab 4' },
    ])('skips disabled adjacent tabs when $key key is pressed', async ({ key, from, to }) => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: from })

      await user.tab()
      await user.keyboard(`{${key}}`)

      expect(screen.getByRole('tab', { name: new RegExp(to, 'i') })).toHaveFocus()
    })

    it('wraps from last tab to first when ArrowRight key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-4' })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveFocus()
    })

    it('wraps from first tab to last when ArrowLeft key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{ArrowLeft}')

      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveFocus()
    })

    it('focuses and activates the first tab when Home key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-4' })

      await user.tab()
      await user.keyboard('{Home}')

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveFocus()
      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
    })

    it('focuses and activates the last non-disabled tab when End key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{End}')

      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveFocus()
      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('keyboard navigation (manual mode)', () => {
    it('moves focus without activating the tab', async () => {
      const user = userEvent.setup()

      renderTabs({ activationMode: 'manual', defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 1/i })).toBeVisible()
      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveFocus()
      expect(screen.queryByRole('tabpanel', { name: /tab 2/i })).not.toBeInTheDocument()
    })

    it('activates the focused tab when Enter key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ activationMode: 'manual', defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{Enter}')

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 2/i })).toBeVisible()
    })

    it('activates the focused tab when Space key is pressed', async () => {
      const user = userEvent.setup()

      renderTabs({ activationMode: 'manual', defaultValue: 'tab-1' })

      await user.tab()
      await user.keyboard('{ArrowRight}')
      await user.keyboard(' ')

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 2/i })).toBeVisible()
    })
  })

  describe('disabled tabs', () => {
    it('marks disabled tabs with the disabled attribute', () => {
      renderTabs()

      expect(screen.getByRole('tab', { name: /tab 3/i })).toBeDisabled()
    })

    it('never gives focus to a disabled tab via keyboard', async () => {
      const user = userEvent.setup()

      renderTabs({ defaultValue: 'tab-2' })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: /tab 3/i })).not.toHaveFocus()
      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveFocus()
    })

    describe('at the boundaries', () => {
      function renderBoundary(props: TabsProps = {}) {
        return render(
          <Tabs {...props}>
            <Tabs.List>
              <Tabs.Tab value="tab-1" disabled>
                Tab 1
              </Tabs.Tab>
              <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
              <Tabs.Tab value="tab-3">Tab 3</Tabs.Tab>
              <Tabs.Tab value="tab-4" disabled>
                Tab 4
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="tab-1">Content 1</Tabs.Panel>
            <Tabs.Panel value="tab-2">Content 2</Tabs.Panel>
            <Tabs.Panel value="tab-3">Content 3</Tabs.Panel>
            <Tabs.Panel value="tab-4">Content 4</Tabs.Panel>
          </Tabs>
        )
      }

      it('fallback selects first non-disabled tab when leading tab is disabled', () => {
        renderBoundary()

        expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      })

      it.each([
        { key: 'Home', target: 'tab 2' },
        { key: 'End', target: 'tab 3' },
      ])('$key key focuses $target skipping the disabled boundary', async ({ key, target }) => {
        const user = userEvent.setup()

        renderBoundary({ defaultValue: 'tab-2' })

        await user.tab()
        await user.keyboard(`{${key}}`)

        expect(screen.getByRole('tab', { name: new RegExp(target, 'i') })).toHaveFocus()
      })
    })
  })

  describe('controlled mode', () => {
    it('reflects the value prop', () => {
      renderTabs({ value: 'tab-2' })

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 2/i })).toBeVisible()
    })

    it('ignores defaultValue when value is provided', () => {
      renderTabs({ defaultValue: 'tab-1', value: 'tab-2' })

      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
    })

    it('does not update display when a tab is clicked', async () => {
      const user = userEvent.setup()

      renderTabs({ value: 'tab-1' })

      await user.click(screen.getByRole('tab', { name: /tab 2/i }))

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel', { name: /tab 1/i })).toBeVisible()
    })

    it('calls onValueChange when a tab is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderTabs({ value: 'tab-1', onValueChange })

      await user.click(screen.getByRole('tab', { name: /tab 2/i }))

      expect(onValueChange).toHaveBeenCalledWith('tab-2')
    })
  })

  describe('onValueChange callback', () => {
    it('is called when a tab is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderTabs({ defaultValue: 'tab-1', onValueChange })

      await user.click(screen.getByRole('tab', { name: /tab 2/i }))

      expect(onValueChange).toHaveBeenCalledWith('tab-2')
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it('is not called when the already-active tab is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderTabs({ defaultValue: 'tab-1', onValueChange })

      await user.click(screen.getByRole('tab', { name: /tab 1/i }))

      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('is called when keyboard navigates in auto mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderTabs({ defaultValue: 'tab-1', onValueChange })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(onValueChange).toHaveBeenCalledWith('tab-2')
    })

    it('is not called when keyboard navigates in manual mode', async () => {
      const user = userEvent.setup()
      const onValueChange = jest.fn()

      renderTabs({ activationMode: 'manual', defaultValue: 'tab-1', onValueChange })

      await user.tab()
      await user.keyboard('{ArrowRight}')

      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('is called with the rebase target when defaultValue is invalid', () => {
      const onValueChange = jest.fn()

      renderTabs({ defaultValue: 'unknown', onValueChange })

      expect(onValueChange).toHaveBeenCalledWith('tab-1')
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('uses role tablist on the list', () => {
      renderTabs()

      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('uses role tab on tabs', () => {
      renderTabs()

      expect(screen.getAllByRole('tab')).toHaveLength(4)
    })

    it('uses role tabpanel on the visible panel', () => {
      renderTabs({ defaultValue: 'tab-1' })

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    })

    it('reflects selected state with aria-selected', () => {
      renderTabs({ defaultValue: 'tab-2' })

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveAttribute('aria-selected', 'false')
    })

    it('uses roving tabindex (active tab 0, inactive tabs -1)', () => {
      renderTabs({ defaultValue: 'tab-2' })

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('tabindex', '-1')
      expect(screen.getByRole('tab', { name: /tab 2/i })).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('tab', { name: /tab 4/i })).toHaveAttribute('tabindex', '-1')
    })

    it('links tab to panel with aria-controls / aria-labelledby', () => {
      renderTabs({ defaultValue: 'tab-1' })

      const tab = screen.getByRole('tab', { name: /tab 1/i })
      const panel = screen.getByRole('tabpanel', { name: /tab 1/i })

      expect(tab).toHaveAttribute('aria-controls', panel.id)
      expect(panel).toHaveAttribute('aria-labelledby', tab.id)
    })

    it('sets button type on tabs', () => {
      renderTabs()

      expect(screen.getByRole('tab', { name: /tab 1/i })).toHaveAttribute('type', 'button')
    })
  })

  describe('multiple instances', () => {
    it('generates unique IDs across instances via useId', () => {
      render(
        <>
          <Tabs defaultValue="a">
            <Tabs.List>
              <Tabs.Tab value="a">First</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="a">First content</Tabs.Panel>
          </Tabs>
          <Tabs defaultValue="a">
            <Tabs.List>
              <Tabs.Tab value="a">Second</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="a">Second content</Tabs.Panel>
          </Tabs>
        </>
      )

      const firstTab = screen.getByRole('tab', { name: /first/i })
      const secondTab = screen.getByRole('tab', { name: /second/i })
      const firstPanel = screen.getByRole('tabpanel', { name: /first/i })
      const secondPanel = screen.getByRole('tabpanel', { name: /second/i })

      expect(firstTab.id).not.toBe(secondTab.id)
      expect(firstPanel.id).not.toBe(secondPanel.id)
      expect(firstTab).toHaveAttribute('aria-controls', firstPanel.id)
      expect(secondTab).toHaveAttribute('aria-controls', secondPanel.id)
    })
  })

  describe('error handling', () => {
    let errorSpy: jest.SpyInstance

    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('throws when List is outside Tabs', () => {
      const ui = (
        <Tabs.List>
          <span>orphan</span>
        </Tabs.List>
      )

      expect(() => render(ui)).toThrow('Tabs compound components must be used within <Tabs>')
    })

    it('throws when Tab is outside Tabs', () => {
      const ui = <Tabs.Tab value="x">Orphan</Tabs.Tab>

      expect(() => render(ui)).toThrow('Tabs compound components must be used within <Tabs>')
    })

    it('throws when Panel is outside Tabs', () => {
      const ui = <Tabs.Panel value="x">Orphan</Tabs.Panel>

      expect(() => render(ui)).toThrow('Tabs compound components must be used within <Tabs>')
    })
  })
})
