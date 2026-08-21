export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="px-6 pt-6 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-paper-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-paper-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="sounding-rule mt-4 text-ink-600" />
    </div>
  )
}
