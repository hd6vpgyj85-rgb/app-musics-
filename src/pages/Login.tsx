import { FormEvent, useState } from 'react'
import { Music2, Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Login() {
  const { hasAccount, user, register, login, error, clearError } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isRegister = !hasAccount

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    if (isRegister) {
      if (password !== confirm) {
        useAuthStore.setState({ error: 'Las contraseñas no coinciden.' })
        setSubmitting(false)
        return
      }
      await register(username, password)
    } else {
      await login(password)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent2-600/20 blur-3xl" />

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow mb-4">
            <Music2 size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sonora</h1>
          <p className="text-sm text-text-muted mt-1">Tu biblioteca musical, privada y offline</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface bg-elevated p-6 space-y-4 shadow-elevated">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            {isRegister ? <ShieldCheck size={16} /> : <Lock size={16} />}
            <span className="text-sm font-medium">{isRegister ? 'Crea tu acceso privado' : `Hola de nuevo, ${user?.username}`}</span>
          </div>

          {isRegister && (
            <Input label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu_usuario" autoFocus required />
          )}

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus={!isRegister}
            required
            minLength={4}
          />

          {isRegister && (
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {isRegister ? 'Crear mi biblioteca' : 'Entrar'}
          </Button>

          <p className="text-[11px] text-text-faint text-center leading-relaxed pt-1">
            Tus datos y tu música se guardan únicamente en este dispositivo. No se envían a ningún servidor.
          </p>
        </form>
      </div>
    </div>
  )
}
