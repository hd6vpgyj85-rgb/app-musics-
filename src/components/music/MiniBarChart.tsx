interface Props {
  data: { label: string; value: number }[]
  height?: number
}

export function MiniBarChart({ data, height = 120 }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
          <span className="text-[10px] text-text-faint mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-fast tabular-nums">
            {Math.round(d.value)}
          </span>
          <div
            className="w-full rounded-t-sm bg-brand-gradient transition-all duration-base hover:brightness-110"
            style={{ height: `${Math.max(3, (d.value / max) * (height - 20))}px`, minHeight: 3 }}
          />
          <span className="text-[9px] text-text-faint mt-1.5">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
