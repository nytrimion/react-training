import type { ReactNode } from 'react'

type CardBodyProps = {
  children: ReactNode
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>
}
