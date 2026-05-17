import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import api from '@/api'
import type { GraphData, GraphNode } from '@/types'
import type { ForceGraphInstance, ForceGraph3DFactory } from '3d-force-graph'
import type * as THREE from 'three'

interface MindGraphProps {
    visible: boolean
}

interface MindGraphEmit {
    (event: 'node-click', nodeId: number | string): void
}

const NODE_COLORS: Record<string, string> = {
    default: '#ffffff',
    dawn: '#38bdf8',
    sakura: '#fb7185',
    spring: '#34d399'
}

interface PositionedGraphNode extends GraphNode {
    x?: number
    y?: number
    z?: number
}

export function getMindGraphNodeColor(theme?: string | null): string {
    return NODE_COLORS[theme ?? ''] || '#3b82f6'
}

export function getMindGraphTooltipHtml(node: Pick<GraphNode, 'author' | 'label'>): string {
    return `<div class="node-tooltip"><b>${node.author}</b><br/>${node.label}</div>`
}

export function getMindGraphCameraTarget(node: PositionedGraphNode, distance = 180) {
    const nx = node.x ?? 0
    const ny = node.y ?? 0
    const nz = node.z ?? 0
    const magnitude = Math.hypot(nx, ny, nz)
    const distRatio = magnitude === 0 ? 1 : 1 + distance / magnitude

    return { x: nx * distRatio, y: ny * distRatio, z: nz * distRatio }
}

export function shouldShowMindGraphLabels(
    cameraPosition: { x: number; y: number; z: number },
    showLinks: boolean
): boolean {
    return Math.hypot(cameraPosition.x, cameraPosition.y, cameraPosition.z) < 180 && showLinks
}

export function useMindGraph3D(props: MindGraphProps, emit: MindGraphEmit) {
    const container: Ref<HTMLElement | null> = ref(null)
    const graphElement: Ref<HTMLElement | null> = ref(null)
    const loading: Ref<boolean> = ref(true)
    const showLinks: Ref<boolean> = ref(true)

    let graph: ForceGraphInstance | null = null
    let resizeObserver: ResizeObserver | null = null
    let ForceGraph3D: ForceGraph3DFactory | null = null
    let THREE: typeof import('three') | null = null

    async function init3DGraph(): Promise<void> {
        loading.value = true
        try {
            const res = await api.getGraphData()
            const data = res.data

            if (!data.nodes || data.nodes.length === 0) return

            await render3D(data)
        } catch (e) {
            console.error('3D Graph fetch failed', e)
        } finally {
            loading.value = false
        }
    }

    async function render3D(data: GraphData): Promise<void> {
        if (!graphElement.value) return
        if (!ForceGraph3D || !THREE) {
            const [forceGraphModule, threeModule] = await Promise.all([import('3d-force-graph'), import('three')])
            ForceGraph3D = forceGraphModule.default
            THREE = threeModule
        }

        graph = ForceGraph3D()(graphElement.value)
            .graphData(data)
            .backgroundColor('#161616')
            .showNavInfo(false)
            .nodeColor((node: unknown) => getMindGraphNodeColor((node as GraphNode).theme))
            .nodeLabel((node: unknown) => getMindGraphTooltipHtml(node as GraphNode))
            .nodeRelSize(5)
            .nodeOpacity(0.8)
            .nodeThreeObject(createNodeObject)
            .linkColor(() => '#444444')
            .linkWidth(0.5)
            .linkOpacity(showLinks.value ? 0.2 : 0)
            .onNodeClick(handleNodeClick)

        if (graph.controls()) {
            graph.controls()!.addEventListener('change', updateNodeLabels)
        }

        updateNodeLabels()
        bindResize()
    }

    function createNodeObject(node: unknown): THREE.Group {
        if (!THREE) throw new Error('THREE not loaded')
        const group = new THREE.Group()
        const n = node as GraphNode

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(8),
            new THREE.MeshLambertMaterial({
                color: getMindGraphNodeColor(n.theme),
                transparent: true,
                opacity: 0.7
            })
        )
        group.add(sphere)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const text = n.label.length > 50 ? `${n.label.substring(0, 50)}...` : n.label

        canvas.width = 800
        canvas.height = 80
        ctx.font = 'bold 28px Inter, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.textAlign = 'center'
        ctx.fillText(text, 400, 50)

        const texture = new THREE.CanvasTexture(canvas)
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(100, 10, 1)
        sprite.position.y = 25
        sprite.name = 'node-label'
        sprite.visible = false

        group.add(sprite)
        return group
    }

    function handleNodeClick(node: unknown): void {
        if (!graph) return
        const n = node as PositionedGraphNode
        graph.cameraPosition(getMindGraphCameraTarget(n), node, 1500)
        emit('node-click', n.id)
    }

    function bindResize(): void {
        resizeObserver?.disconnect()
        resizeObserver = new ResizeObserver(() => {
            if (graph && container.value) {
                const { clientWidth, clientHeight } = container.value
                graph.width(clientWidth)
                graph.height(clientHeight)
            }
        })
        resizeObserver.observe(container.value!)
    }

    function updateNodeLabels(): void {
        if (!graph) return
        const pos = graph.cameraPosition()
        const shouldShow = shouldShowMindGraphLabels(pos, showLinks.value)

        graph.scene().traverse((obj: THREE.Object3D) => {
            if (obj.name === 'node-label') {
                obj.visible = shouldShow
                if (obj.material) {
                    obj.material.opacity = shouldShow ? Math.min((obj.material.opacity ?? 1) + 0.15, 0.95) : 0
                }
            }
        })
    }

    function resetCamera(): void {
        if (graph) graph.zoomToFit(1000)
    }

    function toggleLinks(): void {
        showLinks.value = !showLinks.value
        if (graph) {
            graph.linkOpacity(showLinks.value ? 0.2 : 0)
            updateNodeLabels()
        }
    }

    onMounted(() => {
        if (props.visible) init3DGraph()
    })

    watch(
        () => props.visible,
        val => {
            if (val && !graph) init3DGraph()
        }
    )

    onUnmounted(() => {
        resizeObserver?.disconnect()
        graph?._destructor?.()
    })

    return {
        container,
        graphElement,
        loading,
        showLinks,
        resetCamera,
        toggleLinks
    }
}
