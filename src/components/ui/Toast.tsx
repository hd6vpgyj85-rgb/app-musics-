import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const icons = {
  success: <CheckCircle2 size={18} className="text-success shrink-0" />,
  error: <XCircle size={18} className="text-danger shrink-0" />,
  info: <Info size={18} className="text-accent-400 shrink-0" />,
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 bg-elevated border border-border rounded-md px-4 py-3 shadow-elevated animate-slide-up"
        >
          {icons[t.variant]}
          <span className="text-sm flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-text-faint hover:text-text transition-colors duration-fast" aria-label="Descartar">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
