import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Download, Upload, Lock, LogOut, ShieldAlert, HardDrive, Loader2, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { exportBackup, downloadBackup, importBackup } from '../lib/backup'
import { useAuthStore } from '../store/authStore'
import { usePlayerStore } from '../store/playerStore'
import { useToastStore } from '../store/toastStore'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const lock = useAuthStore((s) => s.lock)
  const logout = useAuthStore((s) => s.logout)
  const stop = usePlayerStore((s) => s.stop)
  const push = useToastStore((s) => s.push)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null)
  const [importing, setImporting] = useState(false)
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [wipeConfirm, setWipeConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((r) => setStorage({ usage: r.usage ?? 0, quota: r.quota ?? 0 }))
    }
  }, [])

  async function handleExport() {
    setExporting(true)
    setExportProgress({ done: 0, total: 1 })
    try {
      const blob = await exportBackup((done, total) => setExportProgress({ done, total }))
      downloadBackup(blob)
      push('Respaldo descargado correctamente.', 'success')
    } catch {
      push('No se pudo generar el respaldo.', 'error')
    } finally {
      setExporting(false)
      setExportProgress(null)
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImporting(true)
    try {
      const result = await importBackup(file)
      push(`Respaldo importado: ${result.songs} canciones, ${result.playlists} playlists.`, 'success')
    } catch {
      push('El archivo de respaldo no es válido.', 'error')
    } finally {
      setImporting(false)
    }
  }

  async function handleWipe() {
    stop()
    await db.transaction(
      'rw',
      [db.artists, db.albums, db.songs, db.playlists, db.playlistSongs, db.favorites, db.playHistory],
      async () => {
        await Promise.all([
          db.artists.clear(),
          db.albums.clear(),
          db.songs.clear(),
          db.playlists.clear(),
          db.playlistSongs.clear(),
          db.favorites.clear(),
          db.playHistory.clear(),
        ])
      },
    )
    setWipeConfirm(false)
    push('Biblioteca eliminada.', 'success')
  }

  const storagePct = storage && storage.quota > 0 ? Math.min(100, (storage.usage / storage.quota) * 100) : 0

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Configuración</h1>
        <p className="text-sm text-text-muted">Gestiona tu cuenta, respaldos y almacenamiento local.</p>
      </div>

      <Section title="Cuenta">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center justify-center text-white font-semibold">
            {user?.username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-text-faint">Cuenta local y privada</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={lock}>
            <Lock size={15} /> Bloquear app
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              stop()
              logout()
            }}
          >
            <LogOut size={15} /> Cerrar sesión
          </Button>
        </div>
      </Section>

      <Section title="Almacenamiento">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive size={16} className="text-text-faint" />
          <span className="text-sm text-text-muted">
            {storage ? `${(storage.usage / 1024 / 1024).toFixed(1)} MB usados` : 'Calculando...'}
            {storage && storage.quota > 0 ? ` de ${(storage.quota / 1024 / 1024 / 1024).toFixed(1)} GB disponibles` : ''}
          </span>
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div className="h-full bg-brand-gradient rounded-full transition-all duration-slow" style={{ width: `${storagePct}%` }} />
        </div>
        <p className="text-xs text-text-faint mt-2">Toda tu música y datos se guardan en este navegador, en este dispositivo.</p>
      </Section>

      <Section title="Respaldo">
        <p className="text-sm text-text-muted mb-4">
          Exporta tu biblioteca completa (canciones, playlists, favoritos, estadísticas y portadas) en un archivo que puedes guardar o transferir.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {exporting && exportProgress ? `Exportando ${exportProgress.done}/${exportProgress.total}` : 'Exportar respaldo'}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Importar respaldo
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </Section>

      <Section title="Privacidad y seguridad">
        <div className="flex gap-3 text-sm text-text-muted">
          <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
          <p>
            Tu contraseña protege el acceso a la interfaz, pero los datos en IndexedDB no están cifrados en disco: cualquier persona con acceso
            directo al perfil de este navegador podría leerlos. Esta app no envía ni comparte datos con ningún servidor.
          </p>
        </div>
      </Section>

      <Section title="Zona de riesgo">
        <Button variant="danger" onClick={() => setWipeConfirm(true)}>
          <Trash2 size={15} /> Eliminar toda la biblioteca
        </Button>
      </Section>

      <ConfirmDialog
        open={wipeConfirm}
        title="Eliminar toda la biblioteca"
        description="Se borrarán todas tus canciones, álbumes, artistas, playlists, favoritos e historial de este dispositivo. Esta acción no se puede deshacer."
        confirmLabel="Eliminar todo"
        danger
        onConfirm={handleWipe}
        onCancel={() => setWipeConfirm(false)}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card-surface bg-surface p-5">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}
