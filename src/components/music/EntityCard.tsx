import { ReactNode } from 'react'
import { Play } from 'lucide-react'
import { CoverImage } from '../ui/CoverImage'

interface Props {
  cover?: Blob
  title: string
  subtitle?: string
  rounded?: 'sm' | 'full'
  onClick: () => void
  onPlay?: () => void
  badge?: ReactNode
  menu?: ReactNode
}

export function EntityCard({ cover, title, subtitle, rounded = 'sm', onClick, onPlay, badge, menu }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="group text-left w-full cursor-pointer"
    >
      <div className="relative">
        <CoverImage blob={cover} alt={title} className="w-full aspect-square shadow-soft" rounded={rounded === 'full' ? 'full' : 'md'} />
        {menu && <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-fast">{menu}</div>}
        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-glow opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-base"
            aria-label={`Reproducir ${title}`}
          >
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </button>
        )}
        {badge && <div className="absolute top-2 left-2">{badge}</div>}
      </div>
      <p className="mt-2.5 text-sm font-medium truncate">{title}</p>
      {subtitle && <p className="text-xs text-text-faint truncate mt-0.5">{subtitle}</p>}
    </div>
  )
}
