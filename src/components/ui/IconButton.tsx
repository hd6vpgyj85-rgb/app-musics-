import { ButtonHTMLAttributes, forwardRef } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  label: string
}

const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ active, size = 'md', label, className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-fast active:scale-90 disabled:opacity-30 disabled:pointer-events-none ${sizeMap[size]} ${
        active ? 'text-accent-400' : 'text-text-muted hover:text-text'
      } hover:bg-surface2 ${className}`}
      {...rest}
    >
      {children}
    </button>
  ),
)
IconButton.displayName = 'IconButton'
