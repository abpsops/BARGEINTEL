import { useState } from "react"
import { supabase } from "@/services/supabase/client"
import Logo from "@/components/ui/Logo"

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
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-navy-900">
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Logo className="h-8 w-8 text-white" />
          <span className="font-display text-xl font-semibold tracking-tight text-white">BunkerWatch</span>
        </div>

        <form onSubmit={signIn} className="rounded-xl glass p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-paper-500 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-sm text-paper-100 focus-ring"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-paper-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-sm text-paper-100 focus-ring"
            />
          </div>

          {error && <p className="text-xs text-signal-crit">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gradient-to-r from-brand-500 to-brand-600 text-white py-2 text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-navy-500">
          Access is restricted to users added under Supabase Authentication.
        </p>
      </div>
    </div>
  )
}
