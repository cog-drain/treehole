export function getJson<T = unknown>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw == null ? fallback : JSON.parse(raw)
    } catch {
        return fallback
    }
}

export function setJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value))
}

export function getString(key: string, fallback = ''): string {
    return localStorage.getItem(key) ?? fallback
}

export function setString(key: string, value: string | number | boolean): void {
    localStorage.setItem(key, String(value))
}

export function remove(key: string): void {
    localStorage.removeItem(key)
}
