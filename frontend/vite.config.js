import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // 读取项目根目录 (..) 下的 .env 文件
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const backendPort = env.BACKEND_PORT || 24191
  const backendHost = `127.0.0.1:${backendPort}`

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      host: true, // [建议添加] 允许通过局域网 IP 访问（比如用手机测试）
      proxy: {
        '/api': {
          target: `http://${backendHost}`,
          changeOrigin: true,
        },
        '/uploads': {
          target: `http://${backendHost}`,
          changeOrigin: true,
        },
        '/ws': {
          target: `ws://${backendHost}`,
          ws: true,
          changeOrigin: true,
        }
      }
    }
  }
})
