/**
 * A simplified mariner's compass rose: an emphasized north needle (brand
 * color) against three muted secondary points, with a bearing ring and
 * eight tick marks. Reads clearly as a navigation instrument at both
 * sidebar size (~28px) and favicon size (~16px), unlike a generic
 * icon-in-a-rounded-square lockup.
 */
export default function CompassMark({
  size = 28,
  className = "",
  variant = "light",
}: {
  size?: number
  className?: string
  variant?: "light" | "dark"
}) {
  const ring = variant === "dark" ? "#5B6B8C" : "#A1A1AA"
  const needle = variant === "dark" ? "#818CF8" : "#6366F1"
  const muted = variant === "dark" ? "#5B6B8C" : "#D4D4D8"
  const pivot = variant === "dark" ? "#FFFFFF" : "#18181B"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bearing ring */}
      <circle cx="20" cy="20" r="16.5" stroke={ring} strokeWidth="1.1" opacity="0.6" />

      {/* Eight tick marks at compass points */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4
        const outerR = 16.5
        const innerR = i % 2 === 0 ? 13.6 : 14.8
        const x1 = 20 + outerR * Math.sin(angle)
        const y1 = 20 - outerR * Math.cos(angle)
        const x2 = 20 + innerR * Math.sin(angle)
        const y2 = 20 - innerR * Math.cos(angle)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ring}
            strokeWidth={i % 2 === 0 ? 1.1 : 0.7}
            opacity="0.65"
          />
        )
      })}

      {/* Compass needle — north point emphasized in brand color */}
      <path d="M20 20 L17.2 20 L20 6.5 L22.8 20 Z" fill={needle} />
      {/* South, east, west points — muted */}
      <path d="M20 20 L18.3 20 L20 30.5 L21.7 20 Z" fill={muted} />
      <path d="M20 20 L20 18.3 L30.5 20 L20 21.7 Z" fill={muted} />
      <path d="M20 20 L20 18.3 L9.5 20 L20 21.7 Z" fill={muted} />

      {/* Center pivot */}
      <circle cx="20" cy="20" r="1.6" fill={pivot} />
    </svg>
  )
}
