# Sonora

Biblioteca musical personal, privada y offline. Sube tu música, organízala en playlists y álbumes, y disfrútala sin conexión — todo se guarda localmente en tu navegador (IndexedDB), sin servidores ni servicios externos.

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Stack

React + TypeScript + Vite + Tailwind CSS · Dexie (IndexedDB) · Zustand · PWA con Service Worker para uso offline.

## Notas de privacidad

Toda la música, playlists, favoritos, historial y estadísticas se almacenan únicamente en el navegador del dispositivo. Nada se envía a ningún servidor. El acceso a la app está protegido con usuario/contraseña local, pero los datos en IndexedDB no están cifrados en disco — cualquier persona con acceso directo al perfil del navegador podría leerlos.
