import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages
  base: '/hunt-damage-calculator/',
  plugins: [react()],
})
