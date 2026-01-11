import { ComponentPropsWithoutRef, ReactNode } from 'react'

type CommonAlertProps = {
  variant: 'info' | 'warning' | 'success'
  onRetry?: never
}

type ErrorAlertProps = {
  variant: 'error'
  onRetry?: () => void
}

type AlertProps = (CommonAlertProps | ErrorAlertProps) & {
  title?: string
  children?: ReactNode
} & ComponentPropsWithoutRef<'div'>

export function Alert({ variant, title, onRetry, children, className, ...rest }: AlertProps) {
  const finalClassName = `${className ?? ''} alert-${variant}`.trim()

  return (
    <div role="alert" {...rest} className={finalClassName}>
      {title && <header className="alert-header">{title}</header>}
      {children && (
        <div data-testid="alert-content" className="alert-content">
          {children}
        </div>
      )}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  )
}
