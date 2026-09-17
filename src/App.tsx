import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import { AppShell } from './components/layout/AppShell'
import Home from './pages/Home'
import Songs from './pages/Songs'
import Albums from './pages/Albums'
import AlbumDetail from './pages/AlbumDetail'
import Artists from './pages/Artists'
import ArtistDetail from './pages/ArtistDetail'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  const { ready, hasAccount, unlocked, init } = useAuthStore()

  useEffect(() => {
    void init()
  }, [init])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center animate-pulse-soft">
          <Music2 size={22} className="text-white" />
        </div>
      </div>
    )
  }

  if (!hasAccount || !unlocked) return <Login />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:id" element={<AlbumDetail />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
