import type { ReactNode } from 'react'

type CardFooterProps = {
  children: ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>
}
