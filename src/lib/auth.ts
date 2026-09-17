function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return bufToHex(bytes.buffer)
}

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, keyMaterial, 256)
  return bufToHex(bits)
}

export const UNLOCK_KEY = 'sonora_unlocked'

export function markUnlocked(): void {
  localStorage.setItem(UNLOCK_KEY, '1')
}

export function markLocked(): void {
  localStorage.removeItem(UNLOCK_KEY)
}

export function isMarkedUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === '1'
}
