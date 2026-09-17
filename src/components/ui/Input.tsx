import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react'

interface FieldWrapProps {
  label?: string
  error?: string
  hint?: string
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className = '', id, ...rest }, ref) => (
  <label className="block space-y-1.5" htmlFor={id}>
    {label && <span className="text-xs font-medium text-text-muted">{label}</span>}
    <input
      ref={ref}
      id={id}
      className={`input-base ${error ? 'border-danger focus:border-danger' : ''} ${className}`}
      {...rest}
    />
    {hint && !error && <span className="text-xs text-text-faint">{hint}</span>}
    {error && <span className="text-xs text-danger">{error}</span>}
  </label>
))
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', id, ...rest }, ref) => (
  <label className="block space-y-1.5" htmlFor={id}>
    {label && <span className="text-xs font-medium text-text-muted">{label}</span>}
    <textarea ref={ref} id={id} className={`input-base resize-none ${className}`} {...rest} />
    {error && <span className="text-xs text-danger">{error}</span>}
  </label>
))
Textarea.displayName = 'Textarea'
