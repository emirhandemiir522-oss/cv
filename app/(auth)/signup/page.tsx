'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { signup } from './actions'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await signup(formData)

            if (result?.error) {
                setError(result.error)
                setLoading(false)
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        C
                    </div>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Start your free trial</h2>
                <p className="text-gray-500 text-sm mt-2">Get 7 days of unlimited AI resume optimization</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                        id="signup-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black outline-none transition-all text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Create Password</label>
                    <input
                        id="signup-password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black outline-none transition-all text-gray-900"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg text-sm border bg-red-50 text-red-600 border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-all shadow-lg shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Free Trial'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                    Already checked in?{' '}
                    <Link href="/login" className="text-black hover:underline font-semibold">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    )
}
