interface Item {
  label: string
  sublabel?: string
  value: number
}

export function RankedList({ items }: { items: Item[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))

  if (items.length === 0) return <p className="text-sm text-text-faint py-4">Sin datos todavía.</p>

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-text-faint w-4 shrink-0 tabular-nums">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <p className="text-sm truncate">{item.label}</p>
              <span className="text-xs text-text-faint tabular-nums shrink-0">{item.value}</span>
            </div>
            <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient rounded-full transition-all duration-slow" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
