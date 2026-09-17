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

const LIKELY_NOT_AUDIO = /\.(jpe?g|png|gif|webp|heic|pdf|docx?|xlsx?|pptx?|zip|rar|7z|txt|json|mp4|mov|avi|mkv|webm)$/i

export function isLikelyNotAudio(file: File): boolean {
  if (file.type && !file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
    return LIKELY_NOT_AUDIO.test(file.name) || file.type.startsWith('image/') || file.type === 'application/pdf'
  }
  return LIKELY_NOT_AUDIO.test(file.name)
}
