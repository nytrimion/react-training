import React from 'react'

type CardHeaderProps = {
  title: string
  subtitle?: string
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="card-header">
      <h2>{title}</h2>
      {subtitle && <h3 data-testid="card-header-subtitle">{subtitle}</h3>}
    </div>
  )
}
