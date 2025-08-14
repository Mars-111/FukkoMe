import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('C:/develop/School-Social-Network/certs/key.pem'),
      cert: fs.readFileSync('C:/develop/School-Social-Network/certs/cert.pem')
    },
    host: '0.0.0.0',
    hmr: {
      port: 5173,
      host: 'localhost' // Используйте localhost для HMR WebSocket
    },
    port: 5173,
    allowedHosts: [
      'mars-ssn.ru'
    ]
  }
})
