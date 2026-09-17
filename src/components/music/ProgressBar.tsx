import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../../lib/format'

interface Props {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  size?: 'sm' | 'lg'
}

export function ProgressBar({ currentTime, duration, onSeek, size = 'sm' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragValue, setDragValue] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const shown = dragValue ?? currentTime
  const pct = duration > 0 ? Math.min(100, (shown / duration) * 100) : 0

  function valueFromEvent(clientX: number): number {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return ratio * duration
  }

  useEffect(() => {
    if (!dragging) return
    function onMove(e: PointerEvent) {
      setDragValue(valueFromEvent(e.clientX))
    }
    function onUp(e: PointerEvent) {
      const value = valueFromEvent(e.clientX)
      onSeek(value)
      setDragging(false)
      setDragValue(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, duration, onSeek])

  const height = size === 'lg' ? 'h-1.5' : 'h-1'

  return (
    <div className="flex items-center gap-2.5 w-full select-none">
      <span className="text-[11px] tabular-nums text-text-faint w-9 text-right shrink-0">{formatTime(shown)}</span>
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          setDragging(true)
          setDragValue(valueFromEvent(e.clientX))
        }}
        className={`group relative flex-1 ${height} bg-surface2 rounded-full cursor-pointer`}
      >
        <div className="absolute inset-y-0 left-0 bg-brand-gradient rounded-full" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-soft opacity-0 group-hover:opacity-100 transition-opacity duration-fast"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-text-faint w-9 shrink-0">{formatTime(duration)}</span>
    </div>
  )
}
