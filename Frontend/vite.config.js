import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Proxy all /api calls to Spring Boot backend (optional approach)
      // '/api': { target: 'http://localhost:8080', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') },
    }
  }
})
