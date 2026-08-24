import PageHeader from "@/components/ui/PageHeader"

export default function AuditLog() {
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Record of who changed what, and when." />
      <div className="px-6 pb-10">
        <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Entity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-paper-500 text-sm">
                  No audit events recorded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-paper-500 max-w-2xl">
          The <code className="font-mono">audit_logs</code> table and its Row Level Security policy already exist in
          the Supabase schema — this page will populate once competitor/barge edits and imports start writing to it
          under a connected backend.
        </p>
      </div>
    </div>
  )
}
