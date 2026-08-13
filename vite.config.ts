import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Chemin de base relatif : l'application marche aussi dans un sous-dossier.
  base: './',
  plugins: [react()],
  resolve: {
    // Alias racine-projet : évite d'avoir à typer les modules Node.
    alias: { '@': '/src' },
  },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
})
