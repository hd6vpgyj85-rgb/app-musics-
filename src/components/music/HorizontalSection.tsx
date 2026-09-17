import { ReactNode } from 'react'

export function HorizontalSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-9">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">{children}</div>
    </section>
  )
}
