import { useState } from "react"
import { Anchor } from "lucide-react"
import { supabase } from "@/services/supabase/client"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Anchor className="text-signal-bunker" size={22} strokeWidth={2} />
          <span className="font-display text-xl tracking-tight text-paper-100">BARGEINTEL</span>
        </div>

        <form onSubmit={signIn} className="rounded-lg border border-ink-700 bg-ink-900 p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus-ring"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-800 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus-ring"
            />
          </div>

          {error && <p className="text-xs text-signal-crit">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-signal-bunker text-white py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-paper-500">
          Access is restricted to users added under Supabase Authentication.
        </p>
      </div>
    </div>
  )
}
