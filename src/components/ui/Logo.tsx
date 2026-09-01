/**
 * BunkerWatch mark: a radar scope with a single tracked contact — the
 * product's job in one glyph. Ring and sweep-arm inherit `currentColor`
 * so the mark works in either a light or dark context; the contact dot is
 * a fixed amber, echoing the same colour used elsewhere in the app to
 * flag a tracked/notable event (e.g. the short-gap anomaly highlight in
 * exported reports) — one deliberate accent, not a decorative gradient.
 */
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="15" cy="17" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M15 17L21.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21.5" cy="9.5" r="2.75" fill="#D97706" />
    </svg>
  )
}
