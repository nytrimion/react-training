import React from 'react'

type CardBodyProps = {
  children: React.ReactNode
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>
}
