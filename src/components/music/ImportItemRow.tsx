import { useRef } from 'react'
import { ImagePlus, X, AlertTriangle } from 'lucide-react'
import { CoverImage } from '../ui/CoverImage'
import { Input } from '../ui/Input'
import type { ImportItem } from './ImportModal'

interface Props {
  item: ImportItem
  onChange: (patch: Partial<ImportItem>) => void
  onRemove: () => void
}

export function ImportItemRow({ item, onChange, onRemove }: Props) {
  const coverInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex gap-3 p-3 rounded-md bg-surface border border-border">
      <div className="relative shrink-0">
        <CoverImage blob={item.coverBlob} alt={item.title} className="w-16 h-16" />
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-soft"
          aria-label="Cambiar portada"
          type="button"
        >
          <ImagePlus size={12} />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onChange({ coverBlob: f })
          }}
        />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
        <Input placeholder="Título" value={item.title} onChange={(e) => onChange({ title: e.target.value })} className="col-span-2" />
        <Input placeholder="Artista" value={item.artist} onChange={(e) => onChange({ artist: e.target.value })} />
        <Input placeholder="Álbum (opcional)" value={item.album} onChange={(e) => onChange({ album: e.target.value })} />
        <Input placeholder="Género" value={item.genre} onChange={(e) => onChange({ genre: e.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Año" type="number" value={item.year ?? ''} onChange={(e) => onChange({ year: e.target.value ? parseInt(e.target.value) : undefined })} />
          <Input placeholder="Pista #" type="number" value={item.trackNumber ?? ''} onChange={(e) => onChange({ trackNumber: e.target.value ? parseInt(e.target.value) : undefined })} />
        </div>
        {item.duplicate && (
          <p className="col-span-2 flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle size={12} /> Ya existe una canción similar en tu biblioteca
          </p>
        )}
      </div>

      <button onClick={onRemove} className="self-start text-text-faint hover:text-danger p-1 shrink-0" aria-label="Quitar de la importación" type="button">
        <X size={16} />
      </button>
    </div>
  )
}
