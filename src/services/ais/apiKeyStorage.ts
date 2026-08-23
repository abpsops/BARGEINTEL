const KEY = "bargeintel_aisstream_key"

export function getAisStreamKey(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setAisStreamKey(key: string) {
  try {
    localStorage.setItem(KEY, key)
  } catch {
    // storage unavailable — key will need re-entry each session
  }
}

export function clearAisStreamKey() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // no-op
  }
}
