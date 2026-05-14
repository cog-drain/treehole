export function getJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getString(key, fallback = '') {
  return localStorage.getItem(key) ?? fallback
}

export function setString(key, value) {
  localStorage.setItem(key, String(value))
}

export function remove(key) {
  localStorage.removeItem(key)
}
