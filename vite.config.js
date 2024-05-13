import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fullReloadAlways = {
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" })
    return []
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fullReloadAlways], // alway full reload instead of hot update on code change to prevent phanton users in a chat room after hot update
  base: '/meet/',
  assetsInclude: ['**/*.md']
})
