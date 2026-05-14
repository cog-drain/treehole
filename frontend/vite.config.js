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
          target: `http://${backendHost}`,
          ws: true,
          changeOrigin: true,
        }
      }
    },
    build: {
      // After lazy-loading heavy feature surfaces, the remaining main bundle is
      // dominated by shared UI/runtime dependencies. Keep the warning above the
      // measured app baseline so future regressions are still visible.
      chunkSizeWarningLimit: 1100,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('/three/') || id.includes('/3d-force-graph/')) return 'graph-vendor'
            if (id.includes('/vue/') || id.includes('/pinia/')) return 'vue-vendor'
            if (id.includes('/element-plus/') || id.includes('/lucide-vue-next/')) return 'ui-vendor'
            if (id.includes('/@dicebear/') || id.includes('/d3/')) return 'visual-vendor'
            return 'vendor'
          }
        }
      }
    }
  }
})
