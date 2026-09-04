// A vivid, varied palette — reused everywhere a competitor needs a color
// (avatars, chart series, activity bars) so the same competitor always
// reads as the same color throughout the app.
export const COMPETITOR_PALETTE = [
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#10B981", // emerald
  "#EC4899", // pink
  "#0EA5E9", // sky
  "#F43F5E", // rose
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#EF4444", // red
  "#84CC16", // lime
]

export function colorForCompetitor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return COMPETITOR_PALETTE[Math.abs(hash) % COMPETITOR_PALETTE.length]
}
