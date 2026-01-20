export type FieldError = string | undefined
export type FormErrors = Record<string, FieldError>

export function validateRequired(value: string, message = 'Field is required'): string | undefined {
  return value === '' ? message : undefined
}

export function validateMinLength(
  value: string,
  min: number,
  message = '{min} characters required at least'
): string | undefined {
  return value !== '' && value.length < min ? message.replace('{min}', String(min)) : undefined
}

export function validateEmail(value: string, message = 'Email is invalid'): string | undefined {
  return value !== '' && !value.includes('@') ? message : undefined
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean)
}
