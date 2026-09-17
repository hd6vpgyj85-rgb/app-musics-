import { ChangeEvent, DragEvent, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ImportItemRow } from './ImportItemRow'
import { extractTags, getAudioDuration, isLikelyNotAudio, titleFromFilename } from '../../lib/metadata'
import { addSong, getOrCreateArtist, getOrCreateAlbum } from '../../db/library'
import { db } from '../../db/db'
import { useToastStore } from '../../store/toastStore'

export interface ImportItem {
  key: string
  file: File
  title: string
  artist: string
  album: string
  genre: string
  year?: number
  trackNumber?: number
  description: string
  coverBlob?: Blob
  duration: number
  duplicate: boolean
  loadingTags: boolean
  touchedFields: Set<string>
}

export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<ImportItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const push = useToastStore((s) => s.push)

  async function addFiles(fileList: FileList | File[]) {
    const all = Array.from(fileList)
    const files = all.filter((f) => !isLikelyNotAudio(f))
    const rejected = all.length - files.length
    if (files.length === 0) {
      push('No se detectó ningún archivo de audio en tu selección.', 'error')
      return
    }
    if (rejected > 0) {
      push(`${rejected} archivo${rejected === 1 ? '' : 's'} omitido${rejected === 1 ? '' : 's'} por no parecer audio.`, 'info')
    }

    const existingSongs = await db.songs.toArray()
    const existingArtists = await db.artists.toArray()
    const artistMap = new Map(existingArtists.map((a) => [a.id, a.name.toLowerCase()]))

    const newItems: ImportItem[] = files.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random()}`,
      file,
      title: titleFromFilename(file.name),
      artist: '',
      album: '',
      genre: '',
      description: '',
      duration: 0,
      duplicate: false,
      loadingTags: true,
      touchedFields: new Set<string>(),
    }))

    setItems((prev) => [...prev, ...newItems])

    for (const item of newItems) {
      const [tags, duration] = await Promise.all([extractTags(item.file), getAudioDuration(item.file)])
      setItems((prev) =>
        prev.map((it) => {
          if (it.key !== item.key) return it
          const t = it.touchedFields
          const title = t.has('title') ? it.title : tags.title || it.title
          const artist = t.has('artist') ? it.artist : tags.artist || ''
          const album = t.has('album') ? it.album : tags.album || ''
          const genre = t.has('genre') ? it.genre : tags.genre || ''
          const year = t.has('year') ? it.year : tags.year
          const trackNumber = t.has('trackNumber') ? it.trackNumber : tags.trackNumber
          const coverBlob = t.has('coverBlob') ? it.coverBlob : tags.coverBlob
          const duplicate = existingSongs.some(
            (s) => s.title.toLowerCase() === title.toLowerCase() && artistMap.get(s.artistId) === artist.toLowerCase(),
          )
          return { ...it, title, artist, album, genre, year, trackNumber, coverBlob, duration, duplicate, loadingTags: false }
        }),
      )
    }
  }

  function updateItem(key: string, patch: Partial<ImportItem>) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it
        const touchedFields = new Set(it.touchedFields)
        for (const field of Object.keys(patch)) touchedFields.add(field)
        return { ...it, ...patch, touchedFields }
      }),
    )
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key))
  }

  function reset() {
    setItems([])
    setSaving(false)
  }

  async function handleImport() {
    if (items.length === 0) return
    setSaving(true)
    let imported = 0
    for (const item of items) {
      const artist = await getOrCreateArtist(item.artist || 'Artista desconocido')
      const album = item.album.trim() ? await getOrCreateAlbum(item.album, artist.id, item.year) : undefined
      await addSong({
        title: item.title.trim() || titleFromFilename(item.file.name),
        artistId: artist.id,
        albumId: album?.id,
        genre: item.genre.trim() || undefined,
        year: item.year,
        trackNumber: item.trackNumber,
        duration: item.duration,
        fileBlob: item.file,
        fileType: item.file.type || 'audio/mpeg',
        coverBlob: item.coverBlob,
        description: item.description.trim() || undefined,
      })
      imported++
    }
    push(`${imported} canción${imported === 1 ? '' : 'es'} importada${imported === 1 ? '' : 's'}.`, 'success')
    reset()
    onClose()
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files)
  }

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void addFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!saving) {
          reset()
          onClose()
        }
      }}
      title="Importar música"
      maxWidth="max-w-2xl"
      footer={
        items.length > 0 ? (
          <>
            <Button variant="ghost" onClick={() => reset()} disabled={saving}>
              Limpiar
            </Button>
            <Button onClick={handleImport} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Importar {items.length} canción{items.length === 1 ? '' : 'es'}
            </Button>
          </>
        ) : undefined
      }
    >
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg py-10 flex flex-col items-center justify-center text-center transition-colors duration-fast ${
          dragging ? 'border-accent-500 bg-brand-gradient-soft' : 'border-border'
        }`}
      >
        <UploadCloud size={30} className="text-accent-400 mb-3" />
        <p className="text-sm font-medium mb-1">Arrastra tus canciones aquí</p>
        <p className="text-xs text-text-faint mb-4">MP3, WAV, M4A, FLAC, OGG y otros formatos de audio</p>
        <label className="btn bg-surface2 border border-border text-sm h-9 px-4 cursor-pointer hover:bg-[#262633]">
          Elegir archivos
          <input type="file" multiple className="hidden" onChange={handlePick} />
        </label>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          {items.map((item) => (
            <ImportItemRow key={item.key} item={item} onChange={(patch) => updateItem(item.key, patch)} onRemove={() => removeItem(item.key)} />
          ))}
        </div>
      )}
    </Modal>
  )
}
