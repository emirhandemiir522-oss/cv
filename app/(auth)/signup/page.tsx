'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (authError) {
                throw authError
            }

            if (!authData.user) {
                throw new Error('Failed to create account')
            }

            if (authData.session) {
                router.push('/dashboard')
                router.refresh()
            } else {
                router.push('/login?message=Account created! Please log in.')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        C
                    </div>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Start your free trial</h2>
                <p className="text-gray-500 text-sm mt-2">Get 7 days of unlimited AI resume optimization</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Create Password</label>
                    <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                        required
                    />
                </div>

                {error && (
                    <div className={`p-3 rounded-lg text-sm border ${
                        error.includes('successfully') || error.includes('check your email')
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Free Trial'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                    Already checked in?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    )
}
