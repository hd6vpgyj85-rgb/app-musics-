import Dexie, { type Table } from 'dexie'
import type {
  User,
  Artist,
  Album,
  Song,
  Playlist,
  PlaylistSong,
  Favorite,
  PlayHistoryEntry,
} from '../types'

export class MusicDB extends Dexie {
  users!: Table<User, string>
  artists!: Table<Artist, string>
  albums!: Table<Album, string>
  songs!: Table<Song, string>
  playlists!: Table<Playlist, string>
  playlistSongs!: Table<PlaylistSong, string>
  favorites!: Table<Favorite, string>
  playHistory!: Table<PlayHistoryEntry, string>

  constructor() {
    super('sonora_db')
    this.version(1).stores({
      users: 'id, username',
      artists: 'id, name',
      albums: 'id, artistId, title',
      songs: 'id, artistId, albumId, title, dateAdded',
      playlists: 'id, name, dateModified',
      playlistSongs: 'id, playlistId, songId, position',
      favorites: 'id, songId, dateAdded',
      playHistory: 'id, songId, playedAt',
    })
  }
}

export const db = new MusicDB()
