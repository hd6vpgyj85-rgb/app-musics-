/// <reference types="vite/client" />

declare module 'jsmediatags' {
  interface Tags {
    title?: string
    artist?: string
    album?: string
    year?: string
    genre?: string
    track?: string
    picture?: { data: number[]; format: string }
  }
  interface TagResult {
    tags: Tags
  }
  interface Reader {
    read(cb: { onSuccess: (r: TagResult) => void; onError: (e: unknown) => void }): void
  }
  const jsmediatags: { read(file: Blob | string, cb: { onSuccess: (r: TagResult) => void; onError: (e: unknown) => void }): void }
  export default jsmediatags
}
