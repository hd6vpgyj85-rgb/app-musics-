import { useLiveQuery } from 'dexie-react-hooks'
import { Heart } from 'lucide-react'
import { db } from '../../db/db'
import { toggleFavorite } from '../../db/stats'
import { IconButton } from '../ui/IconButton'

export function FavoriteButton({ songId, size = 'sm' }: { songId: string; size?: 'sm' | 'md' | 'lg' }) {
  const favorite = useLiveQuery(() => db.favorites.where('songId').equals(songId).first(), [songId])
  const isFav = !!favorite

  return (
    <IconButton
      label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      active={isFav}
      size={size}
      onClick={(e) => {
        e.stopPropagation()
        void toggleFavorite(songId)
      }}
    >
      <Heart size={size === 'lg' ? 22 : 16} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'animate-scale-in' : ''} />
    </IconButton>
  )
}
