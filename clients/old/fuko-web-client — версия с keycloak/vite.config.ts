import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync('./https-certs/key.pem'),
      cert: fs.readFileSync('./https-certs/cert.pem')
    },
    hmr: {
      host: '109.228.70.130',
      port: 5173,
      protocol: 'wss'
    },
    allowedHosts: [
      'mars-ssn.ru'
    ]
  }
})
