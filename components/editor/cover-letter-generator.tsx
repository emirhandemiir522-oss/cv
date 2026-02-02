'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export function CoverLetterGenerator({ resume, onGenerate }: { resume: any, onGenerate: (text: string) => void }) {
    const [jobDesc, setJobDesc] = useState('')
    const [generatedLetter, setGeneratedLetter] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleGenerate() {
        if (!jobDesc) return
        setLoading(true)

        try {
            const res = await fetch('/api/ai/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeJson: resume.base_resume_json,
                    jobDescription: jobDesc
                })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setGeneratedLetter(data.coverLetter)
            onGenerate(data.coverLetter)
        } catch (err) {
            alert('Failed to generate cover letter')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Cover Letter Generator
                </h3>
                <p className="text-sm text-gray-600 mt-1">Paste a job description to generate a tailored cover letter.</p>
            </div>

            <div className="p-6 space-y-4">
                {!generatedLetter ? (
                    <>
                        <label className="block text-sm font-medium text-gray-700">Job Description</label>
                        <textarea
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            className="w-full h-40 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            placeholder="Paste job description here..."
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!jobDesc || loading}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Cover Letter'}
                        </button>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Generated Draft</span>
                            <button
                                onClick={() => { navigator.clipboard.writeText(generatedLetter); alert('Copied!') }}
                                className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 h-64 overflow-y-auto">
                            {generatedLetter}
                        </div>
                        <button
                            onClick={() => setGeneratedLetter('')}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-900 w-full text-center"
                        >
                            Start Over
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
