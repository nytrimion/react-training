import { render, screen, within } from '@testing-library/react'
import { DataList } from '@/components/DataList'

describe('DataList', () => {
  const items = ['foo', 'bar']
  const renderItem = jest.fn((item: string) => item)
  const keyExtractor = jest.fn((item: string) => item)

  beforeEach(() => {
    renderItem.mockClear()
    keyExtractor.mockClear()
  })

  it('should display all items with expected structure', () => {
    render(<DataList items={items} renderItem={renderItem} keyExtractor={keyExtractor} />)

    const listItems = within(screen.getByRole('list')).getAllByRole('listitem')

    expect(listItems).toHaveLength(2)
    expect(listItems[0]).toHaveTextContent('foo')
    expect(listItems[1]).toHaveTextContent('bar')
  })

  it('should call renderItem with each item and its index', () => {
    render(<DataList items={items} renderItem={renderItem} keyExtractor={keyExtractor} />)

    expect(renderItem).toHaveBeenCalledWith('foo', 0)
    expect(renderItem).toHaveBeenCalledWith('bar', 1)
  })

  it('should call keyExtractor with each item', () => {
    render(<DataList items={items} renderItem={renderItem} keyExtractor={keyExtractor} />)

    expect(keyExtractor).toHaveBeenCalledWith('foo')
    expect(keyExtractor).toHaveBeenCalledWith('bar')
  })

  it('should display nothing when items are empty and no emptyMessage', () => {
    const { container } = render(
      <DataList items={[]} renderItem={renderItem} keyExtractor={keyExtractor} />
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('should display emptyMessage when provided and items are empty', () => {
    render(
      <DataList
        items={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        emptyMessage="No items"
      />
    )
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('should display header when provided', () => {
    render(
      <DataList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        header="The header"
      />
    )
    expect(screen.getByText('The header')).toBeInTheDocument()
  })

  it('should display footer when provided', () => {
    render(
      <DataList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        footer="The footer"
      />
    )
    expect(screen.getByText('The footer')).toBeInTheDocument()
  })
})
