import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' : le site se déploie tel quel sur GitHub Pages (sous-chemin) ou ailleurs
export default defineConfig({
  base: './',
  plugins: [react()],
})
