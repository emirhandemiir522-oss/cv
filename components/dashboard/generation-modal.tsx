'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, CheckCircle2, Loader2, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface GenerationModalProps {
    isOpen: boolean
    onClose: () => void
    job: {
        title: string
        company: string
        logo?: string
        url: string
        description?: string
    }
}

const STEPS = [
    { label: 'Scanning Job Description', duration: 1500 },
    { label: 'Analyzing Company Culture', duration: 2500 },
    { label: 'Extracting Key Requirements', duration: 1500 },
    { label: 'Drafting Cover Letter', duration: 2000 },
    { label: 'Designing Presentation Slides', duration: 2000 },
    { label: 'Predicting Interview Questions', duration: 1500 },
    { label: 'Finalizing Application Kit', duration: 1000 },
]

export function GenerationModal({ isOpen, onClose, job }: GenerationModalProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)
    const [generatedId, setGeneratedId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!isOpen) return

        // Start the actual generation in background
        const generate = async () => {
            try {
                const res = await fetch('/api/ai/create-app-kit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobUrl: job.url,
                        jobDescription: job.description || `${job.title} at ${job.company}`
                    })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error)

                // Auto-redirect removed to show button
                // setTimeout(() => {
                //    router.push(`/application/${data.id}`)
                // }, 500)
                setGeneratedId(data.id)
                setProgress(100)
                setCurrentStep(STEPS.length)

            } catch (err: any) {
                setError(err.message)
            }
        }

        generate()

    }, [isOpen])

    // Simulation Effect for Progress Bar
    useEffect(() => {
        if (!isOpen || error || generatedId) return

        let stepIndex = 0
        let currentProgress = 0

        const interval = setInterval(() => {
            currentProgress += 1
            setProgress(Math.min(currentProgress, 95)) // Stall at 95 until complete

            // Logic to switch status text based on progress
            const totalSteps = STEPS.length
            const stepThreshold = 100 / totalSteps

            const calculatedStep = Math.floor(currentProgress / stepThreshold)
            if (calculatedStep < totalSteps) {
                setCurrentStep(calculatedStep)
            }

        }, 120) // Slower simulation

        return () => clearInterval(interval)
    }, [isOpen, error, generatedId])

    const handleNavigate = () => {
        if (generatedId) {
            router.push(`/application/${generatedId}`)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${generatedId ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                {generatedId ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {generatedId ? 'Application Kit Ready!' : 'AI Application Assistant'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {generatedId ? 'Your presentation & cover letter are ready.' : 'Crafting personalized application kit...'}
                                </p>
                            </div>
                        </div>
                        {!error && (
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4">
                            Error: {error}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Company Card */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-gray-200" />
                                ) : (
                                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                                        <Building className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-900">{job.title}</h4>
                                    <p className="text-sm text-gray-500">{job.company}</p>
                                </div>
                            </div>

                            {generatedId ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-2"
                                >
                                    <button
                                        onClick={handleNavigate}
                                        className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Customize Presentation
                                    </button>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Proceed to Editor Mode to finalize your slides.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Progress Section */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                            <span>{STEPS[currentStep]?.label || 'Processing...'}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.1 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {STEPS.slice(0, currentStep + 1).map((step, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-2 text-sm text-gray-600"
                                            >
                                                {i < currentStep ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                                                )}
                                                <span className={i === currentStep ? 'font-medium text-gray-900' : ''}>{step.label}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
