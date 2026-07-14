import { Eye, EyeOff } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function getLoginErrorMessage(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('invalid credentials')
  ) {
    return 'Incorrect email or password'
  }
  return message
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError(getLoginErrorMessage(authError.message))
      return
    }

    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pb-8 pt-20 sm:pt-16">
      <div className="relative w-full max-w-sm">
        <div className="rounded border border-border bg-surface p-6 sm:p-8">
          <h1 className="font-display mb-6 text-center text-2xl font-semibold text-text-primary">
            Sign in
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs text-text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                className="login-input input-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="login-input input-dark pr-10"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-accent"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.75} />
                  ) : (
                    <Eye size={18} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {error && (
              <p className="text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
