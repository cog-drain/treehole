import { onMounted, onUnmounted, ref, watch } from 'vue'
import api from '@/api'

const NODE_COLORS = {
    default: '#ffffff',
    dawn: '#38bdf8',
    sakura: '#fb7185',
    spring: '#34d399'
}

export function useMindGraph3D(props, emit) {
    const container = ref(null)
    const graphElement = ref(null)
    const loading = ref(true)
    const showLinks = ref(true)

    let graph = null
    let resizeObserver = null
    let ForceGraph3D = null
    let THREE = null

    async function init3DGraph() {
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

    async function render3D(data) {
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
            .nodeColor(node => getNodeColor(node.theme))
            .nodeLabel(node => `<div class="node-tooltip"><b>${node.author}</b><br/>${node.label}</div>`)
            .nodeRelSize(5)
            .nodeOpacity(0.8)
            .nodeThreeObject(createNodeObject)
            .linkColor(() => '#444444')
            .linkWidth(0.5)
            .linkOpacity(showLinks.value ? 0.2 : 0)
            .onNodeClick(handleNodeClick)

        if (graph.controls()) {
            graph.controls().addEventListener('change', updateNodeLabels)
        }

        updateNodeLabels()
        bindResize()
    }

    function createNodeObject(node) {
        const group = new THREE.Group()

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(8),
            new THREE.MeshLambertMaterial({
                color: getNodeColor(node.theme),
                transparent: true,
                opacity: 0.7
            })
        )
        group.add(sphere)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const text = node.label.length > 50 ? `${node.label.substring(0, 50)}...` : node.label

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

    function handleNodeClick(node) {
        const distance = 180
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)
        graph.cameraPosition({ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, node, 1500)
        emit('node-click', node.id)
    }

    function bindResize() {
        resizeObserver?.disconnect()
        resizeObserver = new ResizeObserver(() => {
            if (graph && container.value) {
                const { clientWidth, clientHeight } = container.value
                graph.width(clientWidth)
                graph.height(clientHeight)
            }
        })
        resizeObserver.observe(container.value)
    }

    function updateNodeLabels() {
        if (!graph) return
        const { x, y, z } = graph.cameraPosition()
        const distance = Math.hypot(x, y, z)
        const shouldShow = distance < 180 && showLinks.value

        graph.scene().traverse(obj => {
            if (obj.name === 'node-label') {
                obj.visible = shouldShow
                obj.material.opacity = shouldShow ? Math.min(obj.material.opacity + 0.15, 0.95) : 0
            }
        })
    }

    function resetCamera() {
        if (graph) graph.zoomToFit(1000)
    }

    function toggleLinks() {
        showLinks.value = !showLinks.value
        if (graph) {
            graph.linkOpacity(showLinks.value ? 0.2 : 0)
            updateNodeLabels()
        }
    }

    function getNodeColor(theme) {
        return NODE_COLORS[theme] || '#3b82f6'
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
