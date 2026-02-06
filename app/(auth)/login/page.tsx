'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight, Github } from 'lucide-react'
import { login } from './actions'

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const msg = searchParams.get('message')
        if (msg) setMessage(msg)
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await login(formData)

            if (result?.error) {
                setError(result.error)
                setLoading(false)
                return
            }

            router.refresh()
            router.push('/dashboard')
        } catch {
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8 font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">C</div>
                    CVLink
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h1>
                <p className="text-gray-500">Enter your credentials to verify your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label htmlFor="login-email" className="text-sm font-medium text-gray-900">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-gray-400 text-black"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="login-password" className="text-sm font-medium text-gray-900">Password</label>
                        <Link href="#" className="text-xs text-gray-500 hover:text-black font-medium transition-colors">Forgot password?</Link>
                    </div>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="--------"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-gray-400 text-black"
                        required
                    />
                </div>

                {message && (
                    <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm border border-green-100 flex items-center gap-2">
                        <span className="w-1 h-4 bg-green-500 rounded-full" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                        <span className="w-1 h-4 bg-red-500 rounded-full" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700">
                        <Github className="w-4 h-4" /> Github
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-black hover:underline underline-offset-4">
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
