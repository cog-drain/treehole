import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GraphData } from '@/types'

const vueMock = vi.hoisted(() => ({
    mountedCallbacks: [] as Array<() => void | Promise<void>>,
    unmountedCallbacks: [] as Array<() => void>,
    watchCallback: undefined as ((value: boolean) => void) | undefined
}))

const apiMock = vi.hoisted(() => ({
    getGraphData: vi.fn()
}))

const resizeObserverMock = vi.hoisted(() => ({
    callback: undefined as ResizeObserverCallback | undefined,
    observe: vi.fn(),
    disconnect: vi.fn()
}))

const graphMock = vi.hoisted(() => {
    const controls = { addEventListener: vi.fn() }
    const labelObject = { name: 'node-label', visible: false, material: { opacity: 0 } }
    const graph = {
        graphData: vi.fn().mockReturnThis(),
        backgroundColor: vi.fn().mockReturnThis(),
        showNavInfo: vi.fn().mockReturnThis(),
        nodeColor: vi.fn().mockReturnThis(),
        nodeLabel: vi.fn().mockReturnThis(),
        nodeRelSize: vi.fn().mockReturnThis(),
        nodeOpacity: vi.fn().mockReturnThis(),
        nodeThreeObject: vi.fn().mockReturnThis(),
        linkColor: vi.fn().mockReturnThis(),
        linkWidth: vi.fn().mockReturnThis(),
        linkOpacity: vi.fn().mockReturnThis(),
        onNodeClick: vi.fn().mockReturnThis(),
        controls: vi.fn(() => controls),
        cameraPosition: vi.fn((position?: unknown) => position ?? { x: 90, y: 0, z: 0 }),
        scene: vi.fn(() => ({ traverse: (callback: (object: typeof labelObject) => void) => callback(labelObject) })),
        width: vi.fn().mockReturnThis(),
        height: vi.fn().mockReturnThis(),
        zoomToFit: vi.fn(),
        _destructor: vi.fn()
    }

    return {
        graph,
        controls,
        labelObject,
        factory: vi.fn(() => vi.fn(() => graph))
    }
})

vi.mock('vue', () => ({
    ref: <T>(value: T) => ({ value }),
    onMounted: (callback: () => void | Promise<void>) => vueMock.mountedCallbacks.push(callback),
    onUnmounted: (callback: () => void) => vueMock.unmountedCallbacks.push(callback),
    watch: (_source: () => boolean, callback: (value: boolean) => void) => {
        vueMock.watchCallback = callback
    }
}))

vi.mock('@/api', () => ({
    default: apiMock
}))

vi.mock('3d-force-graph', () => ({
    default: graphMock.factory
}))

vi.mock('three', () => {
    class Group {
        children: unknown[] = []
        add(object: unknown) {
            this.children.push(object)
        }
    }

    class Sprite {
        name = ''
        visible = true
        material: unknown
        position = { y: 0 }
        scale = { set: vi.fn() }
        constructor(material: unknown) {
            this.material = material
        }
    }

    return {
        Group,
        Mesh: class {
            constructor(..._args: unknown[]) {}
        },
        SphereGeometry: class {
            constructor(..._args: unknown[]) {}
        },
        MeshLambertMaterial: class {
            constructor(public options: unknown) {}
        },
        CanvasTexture: class {
            constructor(public canvas: HTMLCanvasElement) {}
        },
        SpriteMaterial: class {
            constructor(public options: unknown) {}
        },
        Sprite
    }
})

import {
    getMindGraphCameraTarget,
    getMindGraphNodeColor,
    getMindGraphTooltipHtml,
    shouldShowMindGraphLabels,
    useMindGraph3D
} from './useMindGraph3D'

const graphData: GraphData = {
    nodes: [{ id: 1, label: 'First node', author: 'Alice', theme: 'dawn', x: 3, y: 4, z: 0 }],
    links: [{ source: 1, target: 2 }]
}

describe('useMindGraph3D pure helpers', () => {
    it('maps node themes to graph colors', () => {
        expect(getMindGraphNodeColor('default')).toBe('#ffffff')
        expect(getMindGraphNodeColor('dawn')).toBe('#38bdf8')
        expect(getMindGraphNodeColor('unknown')).toBe('#3b82f6')
        expect(getMindGraphNodeColor(null)).toBe('#3b82f6')
    })

    it('builds tooltip HTML from graph node fields', () => {
        expect(getMindGraphTooltipHtml({ author: 'Alice', label: 'Hello' })).toBe(
            '<div class="node-tooltip"><b>Alice</b><br/>Hello</div>'
        )
    })

    it('computes camera target positions without dividing by zero', () => {
        expect(getMindGraphCameraTarget({ id: 1, label: 'A', x: 3, y: 4, z: 0 })).toEqual({
            x: 111,
            y: 148,
            z: 0
        })
        expect(getMindGraphCameraTarget({ id: 1, label: 'A', x: 0, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('decides label visibility from camera distance and link state', () => {
        expect(shouldShowMindGraphLabels({ x: 100, y: 0, z: 0 }, true)).toBe(true)
        expect(shouldShowMindGraphLabels({ x: 181, y: 0, z: 0 }, true)).toBe(false)
        expect(shouldShowMindGraphLabels({ x: 100, y: 0, z: 0 }, false)).toBe(false)
    })
})

describe('useMindGraph3D lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vueMock.mountedCallbacks = []
        vueMock.unmountedCallbacks = []
        vueMock.watchCallback = undefined
        resizeObserverMock.callback = undefined

        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(callback: ResizeObserverCallback) {
                    resizeObserverMock.callback = callback
                }
                observe = resizeObserverMock.observe
                disconnect = resizeObserverMock.disconnect
            }
        )
        vi.stubGlobal('document', {
            createElement: vi.fn(() => ({
                width: 0,
                height: 0,
                getContext: vi.fn(() => ({
                    font: '',
                    fillStyle: '',
                    textAlign: '',
                    fillText: vi.fn()
                }))
            }))
        })
    })

    it('does not create a graph when fetched data is empty', async () => {
        apiMock.getGraphData.mockResolvedValue({ data: { nodes: [], links: [] } })
        const state = useMindGraph3D({ visible: true }, vi.fn())
        state.graphElement.value = {} as HTMLElement

        await vueMock.mountedCallbacks[0]!()

        expect(apiMock.getGraphData).toHaveBeenCalledOnce()
        expect(graphMock.factory).not.toHaveBeenCalled()
        expect(state.loading.value).toBe(false)
    })

    it('initializes when visible, updates links and resize, and cleans up on unmount', async () => {
        apiMock.getGraphData.mockResolvedValue({ data: graphData })
        const emit = vi.fn()
        const state = useMindGraph3D({ visible: true }, emit)
        state.graphElement.value = {} as HTMLElement
        state.container.value = { clientWidth: 640, clientHeight: 360 } as HTMLElement

        await vueMock.mountedCallbacks[0]!()

        await vi.waitFor(() => expect(graphMock.graph.graphData).toHaveBeenCalledWith(graphData))
        expect(graphMock.graph.linkOpacity).toHaveBeenLastCalledWith(0.2)
        expect(graphMock.controls.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
        expect(resizeObserverMock.observe).toHaveBeenCalledWith(state.container.value)

        state.toggleLinks()
        expect(state.showLinks.value).toBe(false)
        expect(graphMock.graph.linkOpacity).toHaveBeenLastCalledWith(0)
        expect(graphMock.labelObject.visible).toBe(false)

        resizeObserverMock.callback?.([], {} as ResizeObserver)
        expect(graphMock.graph.width).toHaveBeenCalledWith(640)
        expect(graphMock.graph.height).toHaveBeenCalledWith(360)

        const nodeClick = graphMock.graph.onNodeClick.mock.calls.at(-1)?.[0] as (node: unknown) => void
        nodeClick({ id: 'node-1', label: 'First node', x: 3, y: 4, z: 0 })
        expect(graphMock.graph.cameraPosition).toHaveBeenCalledWith({ x: 111, y: 148, z: 0 }, expect.any(Object), 1500)
        expect(emit).toHaveBeenCalledWith('node-click', 'node-1')

        vueMock.unmountedCallbacks[0]!()
        expect(resizeObserverMock.disconnect).toHaveBeenCalled()
        expect(graphMock.graph._destructor).toHaveBeenCalled()
    })

    it('waits for visible changes before fetching graph data', async () => {
        apiMock.getGraphData.mockResolvedValue({ data: graphData })
        const state = useMindGraph3D({ visible: false }, vi.fn())
        state.graphElement.value = {} as HTMLElement

        vueMock.mountedCallbacks[0]!()
        expect(apiMock.getGraphData).not.toHaveBeenCalled()

        vueMock.watchCallback?.(true)
        expect(apiMock.getGraphData).toHaveBeenCalledOnce()
        await vi.waitFor(() => expect(graphMock.graph.graphData).toHaveBeenCalledWith(graphData))
    })
})
