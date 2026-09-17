import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon={<Compass size={28} />}
      title="Página no encontrada"
      description="La sección que buscas no existe o fue movida."
      action={<Button onClick={() => navigate('/')}>Volver al inicio</Button>}
    />
  )
}
