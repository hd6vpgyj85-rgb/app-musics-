import { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-brand-gradient-soft flex items-center justify-center text-accent-400 mb-5">{icon}</div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6 text-balance">{description}</p>
      {action}
    </div>
  )
}
