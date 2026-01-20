import { ChangeEvent, FocusEvent, FormEvent, useMemo, useState } from 'react'
import {
  type FieldError,
  type FormErrors,
  hasErrors,
  validateEmail,
  validateMinLength,
  validateRequired,
} from './validators'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

type Validator = (value: string) => FieldError
type ContactFormProps = {
  onSubmit: (data: ContactFormData) => void
}

const validators: Record<keyof ContactFormData, Validator> = {
  name: (value: string) =>
    validateRequired(value, 'Name is required') ??
    validateMinLength(value, 2, 'Name must be at least 2 characters'),
  email: (value: string) =>
    validateRequired(value, 'Email is required') ??
    validateEmail(value, 'Please enter a valid email'),
  message: (value: string) =>
    validateRequired(value, 'Message is required') ??
    validateMinLength(value, 10, 'Message must be at least 10 characters'),
}

function validateField(name: keyof ContactFormData, value: string): FieldError {
  return validators[name](value)
}

function validateForm(form: ContactFormData): FormErrors {
  const newErrors: FormErrors = {}
  let name: keyof ContactFormData

  for (name in form) {
    const error = validateField(name, form[name])

    if (error) newErrors[name] = error
  }

  return newErrors
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const submitDisabled = useMemo(() => hasErrors(validateForm(form)), [form])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.currentTarget
    const error = validateField(name as keyof ContactFormData, value)

    setErrors((prev) => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[name] = error
      } else {
        delete newErrors[name]
      }
      return newErrors
    })
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()

    const newErrors = validateForm(form)

    if (hasErrors(newErrors)) {
      setErrors(newErrors)
      return
    }

    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-gray-300 rounded px-3 py-2"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="text-red-700">
            {errors.name}
          </span>
        )}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-gray-300 rounded px-3 py-2"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="text-red-700">
            {errors.email}
          </span>
        )}
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-gray-300 rounded px-3 py-2"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="text-red-700">
            {errors.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={submitDisabled}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  )
}
