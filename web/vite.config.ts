import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

const API_TARGETS = {
  local: 'http://localhost:3000',
  remote: 'https://liftlog-production-f08e.up.railway.app',
} as const

export default defineConfig(({ mode }) => {
  const target = mode === 'remote' ? API_TARGETS.remote : API_TARGETS.local

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})