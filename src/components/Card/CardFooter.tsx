import React from 'react'

type CardFooterProps = {
  children: React.ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>
}
