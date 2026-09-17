import { NavLink } from 'react-router-dom'
import { Home, Music2, ListMusic, Heart, Settings } from 'lucide-react'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/songs', label: 'Canciones', icon: Music2 },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/settings', label: 'Ajustes', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-elevated/95 backdrop-blur border-t border-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-fast ${
              isActive ? 'text-accent-400' : 'text-text-faint'
            }`
          }
        >
          <Icon size={20} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
