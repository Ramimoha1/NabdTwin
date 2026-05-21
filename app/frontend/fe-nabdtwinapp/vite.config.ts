import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Load repo-root .env so frontend uses the same environment as backend.
// Avoid a runtime dependency on `dotenv` by parsing the file directly.
const rootEnv = path.resolve(__dirname, '..', '..', '..', '.env')
if (fs.existsSync(rootEnv)) {
  const envFile = fs.readFileSync(rootEnv, 'utf8')
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  }
})
