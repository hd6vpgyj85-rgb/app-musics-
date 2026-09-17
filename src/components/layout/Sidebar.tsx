import { NavLink } from 'react-router-dom'
import { Home, Music2, Disc3, Mic2, ListMusic, Heart, History, BarChart3, Settings, Upload } from 'lucide-react'

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/songs', label: 'Canciones', icon: Music2 },
  { to: '/albums', label: 'Álbumes', icon: Disc3 },
  { to: '/artists', label: 'Artistas', icon: Mic2 },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/stats', label: 'Estadísticas', icon: BarChart3 },
]

interface Props {
  onImportClick: () => void
}

export function Sidebar({ onImportClick }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-dvh sticky top-0 border-r border-border bg-bg px-3 py-5">
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
          <Music2 size={16} className="text-white" />
        </div>
        <span className="font-bold tracking-tight text-lg">Sonora</span>
      </div>

      <button
        onClick={onImportClick}
        className="btn bg-brand-gradient text-white shadow-glow hover:brightness-110 h-10 mb-5 mx-1"
      >
        <Upload size={16} />
        Importar música
      </button>

      <nav className="flex-1 space-y-0.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-fast ${
                isActive ? 'bg-surface text-text' : 'text-text-muted hover:text-text hover:bg-surface'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-fast ${
            isActive ? 'bg-surface text-text' : 'text-text-muted hover:text-text hover:bg-surface'
          }`
        }
      >
        <Settings size={18} />
        Configuración
      </NavLink>
    </aside>
  )
}
