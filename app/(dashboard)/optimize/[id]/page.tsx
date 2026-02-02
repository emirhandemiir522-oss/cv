'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function OptimizePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()
    const [jobUrl, setJobUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'input' | 'analyzing' | 'optimizing' | 'done'>('input')
    const [analysis, setAnalysis] = useState<any>(null)

    async function handleOptimize() {
        if (!jobUrl) return
        setLoading(true)
        setStep('analyzing')

        try {
            // 1. Scrape Job
            const jobRes = await fetch('/api/integrations/linkedin/job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobUrl }),
            })
            const { data: jobData, error: jobError } = await jobRes.json()
            if (jobError) throw new Error(jobError)

            setStep('optimizing')

            // 2. Optimize
            const optimizeRes = await fetch('/api/ai/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId: params.id,
                    jobData,
                    jobUrl,
                }),
            })
            const result = await optimizeRes.json()
            if (result.error) throw new Error(result.error)

            setAnalysis(result.analysis)
            setStep('done')

            // Store version ID for redirect? Or just redirect?
            // Redirecting to editor with new version ID would be ideal if editor supports versions.
            // For now, let's show success and link to it.

        } catch (error: any) {
            console.error(error)
            alert('Optimization failed: ' + error.message)
            setStep('input')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-8">
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    Optimize Resume for Job
                </h1>
                <p className="text-gray-500 mt-2 ml-14 max-w-xl">
                    Paste a LinkedIn job posting URL below. Our AI will analyze the requirements and tailor your resume keywords to beat the ATS.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {step === 'input' && (
                    <div className="p-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Job URL</label>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="https://www.linkedin.com/jobs/view/..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            />
                            <button
                                onClick={handleOptimize}
                                disabled={!jobUrl}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                Start Optimization
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {(step === 'analyzing' || step === 'optimizing') && (
                    <div className="p-12 text-center">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            {/* Spinner rings */}
                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-blue-600 fill-blue-600 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {step === 'analyzing' ? 'Scanning Job Requirements...' : 'Rewriting Your Resume...'}
                        </h3>
                        <p className="text-gray-500 mt-2">
                            {step === 'analyzing' ? 'Extracting keywords and skills' : 'Injecting ATS-friendly keywords and optimizing bullets'}
                        </p>
                    </div>
                )}

                {step === 'done' && analysis && (
                    <div className="divide-y divide-gray-100">
                        <div className="p-8 bg-green-50/50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Optimization Complete!</h3>
                                    <p className="text-green-700 text-sm">Your resume score increased to {analysis.atsScore}/100</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">Matched Keywords</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.matchedKeywords?.map((k: string) => (
                                            <span key={k} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-sm text-gray-500 mb-1">Missing Keywords</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missingKeywords?.map((k: string) => (
                                            <span key={k} className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-md font-medium">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setStep('input')}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Optimize Another
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-sm transition-colors"
                                >
                                    View in Editor
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
