import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'
import path from 'path'

// Custom Vite plugin to handle /api/predict without a full backend
const mlPredictorPlugin = () => {
  return {
    name: 'ml-predictor-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/api/predict' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            const pythonScript = path.resolve(__dirname, 'backend/ml/prediction/predict.py')
            const command = `python "${pythonScript}" '${body.replace(/'/g, "'\\''")}'`
            
            exec(command, (error, stdout, stderr) => {
              if (error) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: stderr || error.message }))
                return
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(stdout)
            })
          })
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mlPredictorPlugin()],
})
