import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Built output is committed and served by GitHub Pages at /components/.
// Source stays here so the repo shows the React and TypeScript, which is the
// point of the artifact.
export default defineConfig({
  plugins: [react()],
  base: '/components/',
  build: {
    outDir: '../components',
    emptyOutDir: true,
    target: 'es2020',
  },
})
