'use client'

import { InfiniteList } from '@/components/InfiniteList'

type Item = {
  id: string
  name: string
}

const items = [
  { name: 'John' },
  { name: 'Jane' },
  { name: 'Bob' },
  { name: 'Cindy' },
  { name: 'Kevin' },
  { name: 'Scarlet' },
  { name: 'Donald' },
  { name: 'Daisy' },
  { name: 'Mickey' },
  { name: 'Winnie' },
  { name: 'Francis' },
  { name: 'Anna' },
  { name: 'Walter' },
  { name: 'Michelle' },
  { name: 'Colin' },
  { name: 'Edwena' },
  { name: 'Roy' },
  { name: 'Maddison' },
  { name: 'Nash' },
  { name: 'Lolicia' },
  { name: 'Ron' },
  { name: 'Delia' },
  { name: 'Curtis' },
  { name: 'Pauline' },
  { name: 'Denver' },
  { name: 'Mora' },
  { name: 'Stacey' },
  { name: 'Zaria' },
  { name: 'Zackary' },
  { name: 'Tatiana' },
  { name: 'Christopher' },
  { name: 'Janette' },
]
const pageSize = 10
const fetchDelay = 2000

const fetchPage = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, fetchDelay))

  const start = pageSize * (page - 1)
  const end = start + pageSize
  const data = items
    .slice(start, end)
    .map((item, index): Item => ({ id: `${start + index + 1}`, ...item }))
  const hasMore = end < items.length

  return {
    data,
    hasMore,
  }
}

const renderItem = (item: Item) => item.name

export default function InfiniteListPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <InfiniteList<Item> fetchPage={fetchPage} renderItem={renderItem} />
      </main>
    </div>
  )
}
