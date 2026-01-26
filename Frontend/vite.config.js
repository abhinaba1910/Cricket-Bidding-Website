import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isLocal=process.argv.includes("dev");
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      "/api":{
        target: isLocal ? "http://localhost:6001":"https://cricket-bidding-website-production.up.railway.app", 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
