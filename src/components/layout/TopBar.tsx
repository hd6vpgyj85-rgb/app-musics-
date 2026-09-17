import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, X, Lock, LogOut, User, Music2, Mic2, Disc3, ListMusic } from 'lucide-react'
import { db } from '../../db/db'
import { listSongsWithRelations, searchLibrary } from '../../db/library'
import { useAuthStore } from '../../store/authStore'
import { usePlayerStore } from '../../store/playerStore'
import { CoverImage } from '../ui/CoverImage'

export function TopBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const lock = useAuthStore((s) => s.lock)
  const logout = useAuthStore((s) => s.logout)
  const stop = usePlayerStore((s) => s.stop)

  const songs = useLiveQuery(() => listSongsWithRelations(), []) ?? []
  const artists = useLiveQuery(() => db.artists.toArray(), []) ?? []
  const albums = useLiveQuery(() => db.albums.toArray(), []) ?? []
  const playlists = useLiveQuery(() => db.playlists.toArray(), []) ?? []

  const results = useMemo(() => searchLibrary(query, songs, artists, albums, playlists), [query, songs, artists, albums, playlists])
  const hasResults = results.songs.length + results.artists.length + results.albums.length + results.playlists.length > 0

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(path: string) {
    navigate(path)
    setQuery('')
    setFocused(false)
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-16 bg-bg/85 backdrop-blur border-b border-border">
      <div ref={containerRef} className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar canciones, artistas, álbumes..."
          className="w-full bg-surface border border-border rounded-full pl-10 pr-9 h-10 text-sm outline-none focus:border-accent-500 transition-colors duration-fast"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text" aria-label="Limpiar búsqueda">
            <X size={15} />
          </button>
        )}

        {focused && query && (
          <div className="absolute top-12 left-0 right-0 card-surface bg-elevated shadow-elevated max-h-[70vh] overflow-y-auto animate-scale-in origin-top">
            {!hasResults && <p className="p-4 text-sm text-text-muted">Sin resultados para "{query}"</p>}

            {results.songs.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-text-faint font-semibold">Canciones</p>
                {results.songs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => go(`/songs?highlight=${s.id}`)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface2 text-left"
                  >
                    <CoverImage blob={s.coverBlob ?? s.album?.coverBlob} alt={s.title} className="w-8 h-8" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{s.title}</p>
                      <p className="text-xs text-text-faint truncate">{s.artist?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.artists.length > 0 && (
              <div className="p-2 border-t border-border-subtle">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-text-faint font-semibold">Artistas</p>
                {results.artists.map((a) => (
                  <button key={a.id} onClick={() => go(`/artists/${a.id}`)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface2 text-left">
                    <Mic2 size={14} className="text-text-faint" /> <span className="text-sm">{a.name}</span>
                  </button>
                ))}
              </div>
            )}

            {results.albums.length > 0 && (
              <div className="p-2 border-t border-border-subtle">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-text-faint font-semibold">Álbumes</p>
                {results.albums.map((a) => (
                  <button key={a.id} onClick={() => go(`/albums/${a.id}`)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface2 text-left">
                    <Disc3 size={14} className="text-text-faint" /> <span className="text-sm">{a.title}</span>
                  </button>
                ))}
              </div>
            )}

            {results.playlists.length > 0 && (
              <div className="p-2 border-t border-border-subtle">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-text-faint font-semibold">Playlists</p>
                {results.playlists.map((p) => (
                  <button key={p.id} onClick={() => go(`/playlists/${p.id}`)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface2 text-left">
                    <ListMusic size={14} className="text-text-faint" /> <span className="text-sm">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 hidden md:flex items-center gap-2 text-text-faint text-xs">
        <Music2 size={14} />
        <span>Sonora — 100% local y offline</span>
      </div>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0"
          aria-label="Menú de cuenta"
        >
          {user?.username.slice(0, 1).toUpperCase() ?? <User size={16} />}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 w-52 card-surface bg-elevated shadow-elevated p-1.5 animate-scale-in origin-top-right">
            <p className="px-3 py-2 text-xs text-text-faint truncate">{user?.username}</p>
            <button
              onClick={() => {
                setMenuOpen(false)
                lock()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-surface2 text-left"
            >
              <Lock size={15} /> Bloquear
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                stop()
                logout()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-surface2 text-left text-danger"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
