import { X, GripVertical, ListMusic } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { CoverImage } from '../ui/CoverImage'
import { IconButton } from '../ui/IconButton'
import { EmptyState } from '../ui/EmptyState'

export function QueuePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const playFromQueueIndex = usePlayerStore((s) => s.playFromQueueIndex)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm h-dvh bg-elevated border-l border-border flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <ListMusic size={17} /> Cola de reproducción
          </h2>
          <IconButton label="Cerrar" size="sm" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {queue.length === 0 ? (
            <EmptyState icon={<ListMusic size={26} />} title="Cola vacía" description="Reproduce una canción para empezar a llenar la cola." />
          ) : (
            queue.map((song, i) => (
              <div
                key={`${song.id}-${i}`}
                onClick={() => playFromQueueIndex(i)}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors duration-fast ${
                  i === queueIndex ? 'bg-surface2' : 'hover:bg-surface'
                }`}
              >
                <GripVertical size={14} className="text-text-faint shrink-0" />
                <CoverImage blob={song.coverBlob ?? song.album?.coverBlob} alt={song.title} className="w-9 h-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${i === queueIndex ? 'text-accent-400' : ''}`}>{song.title}</p>
                  <p className="text-xs text-text-faint truncate">{song.artist?.name}</p>
                </div>
                {i !== queueIndex && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromQueue(i)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-text-faint hover:text-danger p-1 transition-opacity duration-fast"
                    aria-label="Quitar de la cola"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
