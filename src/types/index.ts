export interface User {
  id: string
  username: string
  passwordHash: string
  salt: string
  createdAt: number
}

export interface Artist {
  id: string
  name: string
  imageBlob?: Blob
  createdAt: number
}

export interface Album {
  id: string
  title: string
  artistId: string
  coverBlob?: Blob
  year?: number
  createdAt: number
}

export interface Song {
  id: string
  title: string
  artistId: string
  albumId?: string
  genre?: string
  year?: number
  trackNumber?: number
  duration: number
  fileBlob: Blob
  fileType: string
  coverBlob?: Blob
  description?: string
  dateAdded: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverBlob?: Blob
  dateCreated: number
  dateModified: number
}

export interface PlaylistSong {
  id: string
  playlistId: string
  songId: string
  position: number
  dateAdded: number
}

export interface Favorite {
  id: string
  songId: string
  dateAdded: number
}

export interface PlayHistoryEntry {
  id: string
  songId: string
  playedAt: number
  msPlayed: number
  completed: boolean
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface SongWithRelations extends Song {
  artist?: Artist
  album?: Album
}
