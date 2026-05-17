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
            // 3d-force-graph ships as a large lazy graph engine bundle; keep the limit
            // just above the measured async graph chunk while vendor chunks remain split.
            chunkSizeWarningLimit: 1500,
            modulePreload: {
                resolveDependencies(_filename, deps) {
                    return deps.filter(
                        dep =>
                            !dep.includes('MindGraph') &&
                            !dep.includes('graph-engine') &&
                            !dep.includes('graph-render') &&
                            !dep.includes('graph-layout') &&
                            !dep.includes('three-vendor')
                    )
                }
            },
            rolldownOptions: {
                output: {
                    codeSplitting: true,
                    manualChunks(id: string) {
                        if (!id.includes('node_modules')) return
                        if (id.includes('/node_modules/.pnpm/three@') || id.includes('/node_modules/three/')) {
                            return 'three-vendor'
                        }
                        if (id.includes('three-forcegraph') || id.includes('three-render-objects')) {
                            return 'graph-render'
                        }
                        if (id.includes('3d-force-graph') || id.includes('kapsule') || id.includes('accessor-fn')) {
                            return 'graph-engine'
                        }
                        if (
                            id.includes('d3-force-3d') ||
                            id.includes('ngraph.') ||
                            id.includes('ngraph.forcelayout') ||
                            id.includes('ngraph.graph') ||
                            id.includes('ngraph.merge') ||
                            id.includes('ngraph.random')
                        ) {
                            return 'graph-layout'
                        }
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
