import { useState, KeyboardEvent } from 'react'

type ToggleProps = {
  label?: string
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}

export function Toggle({ label, defaultChecked = false, onChange }: ToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)

  function handleClick(): void {
    const newValue = !checked
    setChecked(newValue)
    onChange?.(newValue)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.repeat) return

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <label>
      {label}
      <button role="switch" aria-checked={checked} onClick={handleClick} onKeyDown={handleKeyDown}>
        {checked ? 'On' : 'Off'}
      </button>
    </label>
  )
}
