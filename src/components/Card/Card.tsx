import React from 'react'

type CardProps = {
  variant?: 'default' | 'outlined' | 'elevated'
  children: React.ReactNode
}

export function Card({ variant = 'default', children }: CardProps) {
  return <article className={`card card-${variant}`}>{children}</article>
}
