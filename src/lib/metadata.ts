import jsmediatags from 'jsmediatags'

export interface ExtractedTags {
  title?: string
  artist?: string
  album?: string
  year?: number
  genre?: string
  trackNumber?: number
  coverBlob?: Blob
}

export function extractTags(file: File): Promise<ExtractedTags> {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: ({ tags }) => {
        let coverBlob: Blob | undefined
        if (tags.picture) {
          const bytes = new Uint8Array(tags.picture.data)
          coverBlob = new Blob([bytes], { type: tags.picture.format })
        }
        const trackNumber = tags.track ? parseInt(tags.track.split('/')[0], 10) : undefined
        resolve({
          title: tags.title || undefined,
          artist: tags.artist || undefined,
          album: tags.album || undefined,
          year: tags.year ? parseInt(tags.year, 10) : undefined,
          genre: tags.genre || undefined,
          trackNumber: Number.isFinite(trackNumber) ? trackNumber : undefined,
          coverBlob,
        })
      },
      onError: () => resolve({}),
    })
  })
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.addEventListener('loadedmetadata', () => {
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0)
      URL.revokeObjectURL(url)
    })
    audio.addEventListener('error', () => {
      resolve(0)
      URL.revokeObjectURL(url)
    })
    audio.src = url
  })
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

const SUPPORTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/ogg']
const SUPPORTED_EXT = /\.(mp3|wav|m4a|flac|ogg)$/i

export function isSupportedAudioFile(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type) || SUPPORTED_EXT.test(file.name)
}
