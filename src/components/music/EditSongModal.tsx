import { useEffect, useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { CoverImage } from '../ui/CoverImage'
import { getOrCreateArtist, getOrCreateAlbum, updateSong } from '../../db/library'
import { useToastStore } from '../../store/toastStore'
import type { SongWithRelations } from '../../types'

interface Props {
  song: SongWithRelations | null
  onClose: () => void
}

export function EditSongModal({ song, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState<number | undefined>()
  const [trackNumber, setTrackNumber] = useState<number | undefined>()
  const [description, setDescription] = useState('')
  const [coverBlob, setCoverBlob] = useState<Blob | undefined>()
  const [saving, setSaving] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const push = useToastStore((s) => s.push)

  useEffect(() => {
    if (!song) return
    setTitle(song.title)
    setArtist(song.artist?.name ?? '')
    setAlbum(song.album?.title ?? '')
    setGenre(song.genre ?? '')
    setYear(song.year)
    setTrackNumber(song.trackNumber)
    setDescription(song.description ?? '')
    setCoverBlob(song.coverBlob)
  }, [song])

  if (!song) return null

  async function handleSave() {
    setSaving(true)
    const newArtist = await getOrCreateArtist(artist || 'Artista desconocido')
    const newAlbum = album.trim() ? await getOrCreateAlbum(album, newArtist.id, year) : undefined
    await updateSong(song!.id, {
      title: title.trim() || song!.title,
      artistId: newArtist.id,
      albumId: newAlbum?.id,
      genre: genre.trim() || undefined,
      year,
      trackNumber,
      description: description.trim() || undefined,
      coverBlob,
    })
    setSaving(false)
    push('Canción actualizada.', 'success')
    onClose()
  }

  return (
    <Modal
      open={!!song}
      onClose={onClose}
      title="Editar canción"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="flex gap-4 mb-4">
        <div className="relative shrink-0">
          <CoverImage blob={coverBlob} alt={title} className="w-20 h-20" />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-soft"
            aria-label="Cambiar portada"
            type="button"
          >
            <ImagePlus size={13} />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setCoverBlob(f)
            }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Artista" value={artist} onChange={(e) => setArtist(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Álbum" value={album} onChange={(e) => setAlbum(e.target.value)} />
        <Input label="Género" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <Input label="Año" type="number" value={year ?? ''} onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : undefined)} />
        <Input label="Número de pista" type="number" value={trackNumber ?? ''} onChange={(e) => setTrackNumber(e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      <Textarea label="Descripción (opcional)" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
    </Modal>
  )
}
