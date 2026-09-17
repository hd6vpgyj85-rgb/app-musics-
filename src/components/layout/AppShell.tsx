import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { TopBar } from './TopBar'
import { PlayerBar } from './PlayerBar'
import { ToastContainer } from '../ui/Toast'
import { ImportModal } from '../music/ImportModal'
import { usePlayerStore } from '../../store/playerStore'
import { useKeyboardShortcuts } from '../../lib/useKeyboardShortcuts'

export function AppShell() {
  const [importOpen, setImportOpen] = useState(false)
  const hasSong = usePlayerStore((s) => !!s.currentSong)
  useKeyboardShortcuts()

  return (
    <div className="flex min-h-dvh">
      <Sidebar onImportClick={() => setImportOpen(true)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className={`flex-1 px-4 md:px-8 pt-5 ${hasSong ? 'pb-40 md:pb-28' : 'pb-24 md:pb-8'}`}>
          <Outlet context={{ openImport: () => setImportOpen(true) }} />
        </main>
      </div>

      <button
        onClick={() => setImportOpen(true)}
        className={`md:hidden fixed right-4 z-40 w-12 h-12 rounded-full bg-brand-gradient text-white shadow-glow flex items-center justify-center active:scale-90 transition-transform duration-fast ${
          hasSong ? 'bottom-[7.5rem]' : 'bottom-[4.75rem]'
        }`}
        aria-label="Importar música"
      >
        <Upload size={20} />
      </button>

      <PlayerBar />
      <MobileNav />
      <ToastContainer />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
