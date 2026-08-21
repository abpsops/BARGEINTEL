import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export default function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-ink-600 bg-ink-800 px-2.5 py-1.5 text-xs text-paper-200 hover:border-ink-500 transition-colors focus-ring"
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded bg-signal-bunker/20 text-signal-bunker px-1 text-[10px] font-mono">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-56 max-h-64 overflow-y-auto scrollbar-thin rounded border border-ink-600 bg-ink-800 shadow-xl">
          {options.length === 0 && <div className="px-3 py-2 text-xs text-paper-500">No options</div>}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-ink-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-signal-bunker"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
