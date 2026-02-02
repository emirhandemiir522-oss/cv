'use client'

import { useState } from 'react'
import { Loader2, Briefcase, X, CheckCircle, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function JobModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState<'input' | 'scraping' | 'analysis' | 'done'>('input')
    const [jobUrl, setJobUrl] = useState('')
    const [jobData, setJobData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        if (!jobUrl) return
        setError(null)
        setStep('scraping')

        try {
            const res = await fetch('/api/integrations/linkedin/job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobUrl }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to scrape job')

            setJobData(data.data)
            setStep('analysis')

            // Here we would trigger AI optimization logic
            // For now, we simulate success
            setTimeout(() => {
                setStep('done')
            }, 1500)

        } catch (err: any) {
            setError(err.message)
            setStep('input')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Job Analyzer</h3>
                            <p className="text-gray-500 text-sm mt-1">Paste a LinkedIn job URL to optimize your CV for it.</p>
                        </div>

                        {step === 'input' && (
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/jobs/view/..."
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!jobUrl}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    Analyze Job
                                </button>
                            </div>
                        )}

                        {(step === 'scraping' || step === 'analysis') && (
                            <div className="text-center py-8">
                                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                                <h4 className="font-semibold text-gray-900">
                                    {step === 'scraping' ? 'Fetching Job Details...' : 'Analyzing Requirements...'}
                                </h4>
                                <p className="text-sm text-gray-500 mt-2">Connecting to LinkedIn...</p>
                            </div>
                        )}

                        {step === 'done' && (
                            <div className="text-center py-6">
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-left border border-green-100">
                                    <h4 className="font-bold mb-1 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Success!
                                    </h4>
                                    <p className="text-sm mb-2">{jobData?.title}</p>
                                    <p className="text-xs opacity-75">{jobData?.companyName}</p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold"
                                >
                                    Start Optimization (Coming Soon)
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
