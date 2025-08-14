import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'
  },
  server: {
    https: {
      key: fs.readFileSync('C:\\develop\\School-Social-Network\\certs\\key.pem'),  // путь к приватному ключу
      cert: fs.readFileSync('C:\\develop\\School-Social-Network\\certs\\cert.pem'),  // путь к сертификату
    },
    host: '0.0.0.0',  // Чтобы сайт был доступен с любого интерфейса
    port: 5173,  // Указываем порт
    allowedHosts: [
      'mars-ssn.ru', // добавляем нужный хост
      'localhost', 
      'www.mars-ssn.ru', 
      'socket.mars-ssn.ru', 
      'chat.mars-ssn.ru', 
      'keycloak.mars-ssn.ru'
    ],

    // hmr: {
    //   protocol: 'wss',
    //   host: 'socket.mars-ssn.ru',
    //   port: 443
    // }
    
  }
});
