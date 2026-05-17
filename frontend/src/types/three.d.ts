declare module 'three' {
    export class Group {
        add(object: Object3D | Mesh | Sprite): void
    }

    export class Object3D {
        name: string
        visible: boolean
        material?: Material
        position: Vector3
    }

    export class Mesh extends Object3D {
        constructor(geometry: BufferGeometry, material: Material)
    }

    export class Sprite extends Object3D {
        scale: Vector3
        material: SpriteMaterial
        constructor(material: SpriteMaterial)
    }

    export class BufferGeometry {}

    export class SphereGeometry extends BufferGeometry {
        constructor(radius: number)
    }

    export class Vector3 {
        x: number
        y: number
        z: number
        set(x: number, y: number, z: number): void
    }

    export class Material {
        color?: unknown
        transparent?: boolean
        opacity?: number
    }

    export class MeshLambertMaterial extends Material {
        constructor(params?: Record<string, unknown>)
    }

    export class SpriteMaterial {
        map: Texture | null
        transparent: boolean
        opacity: number
        constructor(params?: Record<string, unknown>)
    }

    export class Texture {}

    export class CanvasTexture extends Texture {
        constructor(canvas: HTMLCanvasElement)
    }
}

declare module '3d-force-graph' {
    import type { Group, Object3D } from 'three'

    interface ForceGraphInstance {
        (element: HTMLElement): ForceGraphInstance
        graphData(data: unknown): ForceGraphInstance
        backgroundColor(color: string): ForceGraphInstance
        showNavInfo(enabled: boolean): ForceGraphInstance
        nodeColor(accessor: (node: unknown) => string): ForceGraphInstance
        nodeLabel(accessor: (node: unknown) => string): ForceGraphInstance
        nodeRelSize(size: number): ForceGraphInstance
        nodeOpacity(opacity: number): ForceGraphInstance
        nodeThreeObject(factory: (node: unknown) => Group): ForceGraphInstance
        linkColor(accessor: (link: unknown) => string): ForceGraphInstance
        linkWidth(width: number): ForceGraphInstance
        linkOpacity(opacity: number): ForceGraphInstance
        onNodeClick(callback: (node: unknown, event?: MouseEvent) => void): ForceGraphInstance
        controls(): Controls | null
        cameraPosition(): { x: number; y: number; z: number }
        cameraPosition(position: { x: number; y: number; z: number }, lookAt?: unknown, duration?: number): ForceGraphInstance
        zoomToFit(duration: number): void
        width(): number
        width(v: number): ForceGraphInstance
        height(): number
        height(v: number): ForceGraphInstance
        scene(): { traverse: (cb: (obj: Object3D) => void) => void }
        _destructor(): void
    }

    interface Controls {
        addEventListener(event: string, callback: () => void): void
    }

    interface ForceGraph3DFactory {
        (): (element: HTMLElement) => ForceGraphInstance
    }

    const ForceGraph3D: ForceGraph3DFactory

    export type { ForceGraphInstance, ForceGraph3DFactory }
    export default ForceGraph3D
}
