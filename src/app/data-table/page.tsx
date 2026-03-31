'use client'

import { Column, DataTable } from '@/components/DataTable'

const pageSize = 10
const delay = 2000
const errorRate = 0.5
const items = [
  { name: 'David', income: 70000, birthday: '1978-11-17' },
  { name: 'John', income: 50000, birthday: '1965-05-19' },
  { name: 'Jane', income: 56000, birthday: '1994-07-08' },
  { name: 'Bob', income: 48000, birthday: '1986-09-26' },
  { name: 'Cindy', income: 86000, birthday: '1973-04-30' },
  { name: 'Kevin', income: 41000, birthday: '2002-03-12' },
  { name: 'Scarlet', income: 64000, birthday: '1981-06-14' },
  { name: 'Donald', income: 51000, birthday: '1977-10-25' },
  { name: 'Daisy', income: 46000, birthday: '1982-01-26' },
  { name: 'Mickey', income: 68000, birthday: '1961-08-30' },
  { name: 'Winnie', income: 41000, birthday: '1966-05-16' },
  { name: 'Francis', income: 53000, birthday: '1996-12-07' },
  { name: 'Anna', income: 39000, birthday: '1976-11-08' },
  { name: 'Walter', income: 72000, birthday: '1979-09-24' },
  { name: 'Michelle', income: 49000, birthday: '1976-01-17' },
  { name: 'Colin', income: 47000, birthday: '1985-06-18' },
  { name: 'Edwena', income: 38000, birthday: '1987-10-09' },
  { name: 'Roy', income: 40000, birthday: '1986-03-15' },
  { name: 'Maddison', income: 28000, birthday: '2003-07-24' },
  { name: 'Nash', income: 34000, birthday: '2001-08-04' },
  { name: 'Lolicia', income: 42000, birthday: '1998-04-23' },
  { name: 'Ron', income: 57000, birthday: '1994-01-19' },
  { name: 'Delia', income: 63000, birthday: '1982-09-02' },
  { name: 'Curtis', income: 43000, birthday: '1988-05-21' },
  { name: 'Pauline', income: 56000, birthday: '1983-08-17' },
  { name: 'Denver', income: 29000, birthday: '2000-06-28' },
  { name: 'Mora', income: 51000, birthday: '1969-08-23' },
  { name: 'Stacey', income: 36000, birthday: '1989-12-11' },
  { name: 'Zaria', income: 44000, birthday: '1991-02-05' },
  { name: 'Zackary', income: 37000, birthday: '1995-03-21' },
  { name: 'Tatiana', income: 38000, birthday: '1993-09-27' },
  { name: 'Christopher', income: 76000, birthday: '1979-02-25' },
  { name: 'Janette', income: 66000, birthday: '1984-06-19' },
]

interface Item {
  id: number
  name: string
  income: number
  birthday: Date
}

const columns: Column<Item>[] = [
  {
    key: 'id',
    header: '#',
    sortable: true,
    align: 'right',
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'income',
    header: 'Income',
    sortable: true,
    align: 'right',
    render: (_, item) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.income),
  },
  {
    key: 'birthday',
    header: 'Birthday',
    sortable: true,
    render: (_, item) => item.birthday.toISOString().split('T')[0],
  },
]

function fetchData() {
  return new Promise<Item[]>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error('Data promise has failed'))
        return
      }
      resolve(
        items.map((item, index) => ({
          id: index + 1,
          name: item.name,
          income: item.income,
          birthday: new Date(item.birthday),
        }))
      )
    }, delay)
  })
}

export default function DataTablePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <DataTable<Item>
          dataFactory={fetchData}
          columns={columns}
          rowKey={'id'}
          pageSize={pageSize}
        />
      </main>
    </div>
  )
}
