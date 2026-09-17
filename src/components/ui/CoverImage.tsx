import { useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'

interface Props {
  blob?: Blob
  alt: string
  className?: string
  rounded?: 'sm' | 'md' | 'full'
}

const roundedMap = { sm: 'rounded-sm', md: 'rounded-md', full: 'rounded-full' }

export function CoverImage({ blob, alt, className = '', rounded = 'sm' }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  if (!url) {
    return (
      <div className={`bg-brand-gradient-soft flex items-center justify-center text-accent-400 ${roundedMap[rounded]} ${className}`}>
        <Music2 size="40%" strokeWidth={1.5} />
      </div>
    )
  }

  return <img src={url} alt={alt} className={`object-cover ${roundedMap[rounded]} ${className}`} draggable={false} />
}
