import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.resolve(import.meta.dirname, '..'), '')
    const backendPort = env.BACKEND_PORT || 24191
    const backendHost = `127.0.0.1:${backendPort}`

    return {
        plugins: [vue(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(import.meta.dirname, './src')
            }
        },
        server: {
            port: 5173,
            host: true,
            proxy: {
                '/api': {
                    target: `http://${backendHost}`,
                    changeOrigin: true
                },
                '/uploads': {
                    target: `http://${backendHost}`,
                    changeOrigin: true
                },
                '/ws': {
                    target: `http://${backendHost}`,
                    ws: true,
                    changeOrigin: true
                }
            }
        },
        test: {
            setupFiles: ['./src/tests/setup.ts']
        },
        build: {
            chunkSizeWarningLimit: 1100,
            rolldownOptions: {
                output: {
                    manualChunks(id: string) {
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
