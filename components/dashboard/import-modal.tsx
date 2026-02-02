'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X, CheckCircle, FileText, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState<'input' | 'scraping' | 'generating' | 'done'>('input')
    const [mode, setMode] = useState<'linkedin' | 'pdf'>('linkedin')
    const [url, setUrl] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleImport = async () => {
        if (mode === 'linkedin' && !url) return
        if (mode === 'pdf' && !file) return

        setError(null)
        setStep('scraping')

        try {
            let resumeSourceData = null
            let sourceText = null
            let title = 'Resume from LinkedIn'

            if (mode === 'linkedin') {
                // 1. Scrape Profile (LinkedIn)
                const scrapeRes = await fetch('/api/integrations/linkedin/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileUrl: url }),
                })
                const scrapeData = await scrapeRes.json()

                if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Failed to scrape profile')
                resumeSourceData = scrapeData.data
            } else {
                // 1. Parse PDF
                title = 'Resume from PDF'
                const formData = new FormData()
                formData.append('file', file!)

                const parseRes = await fetch('/api/integrations/pdf/extract', {
                    method: 'POST',
                    body: formData,
                })
                const parseData = await parseRes.json()

                if (!parseRes.ok) throw new Error(parseData.error || 'Failed to parse PDF')
                sourceText = parseData.text
            }

            setStep('generating')

            // 2. Generate Resume
            const generateRes = await fetch('/api/ai/generate-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    linkedinData: resumeSourceData,
                    sourceText: sourceText,
                    title: title
                }),
            })
            const generateData = await generateRes.json()

            if (!generateRes.ok) throw new Error(generateData.error || 'Failed to generate resume')

            setStep('done')

            // 3. Redirect
            setTimeout(() => {
                router.push(`/editor/${generateData.resume.id}`)
            }, 1000)

        } catch (err: any) {
            console.error(err)
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
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Import Profile</h3>
                            <p className="text-gray-500 text-sm mt-1">Choose how you want to start.</p>
                        </div>

                        {step === 'input' && (
                            <div className="space-y-6">
                                {/* Tabs */}
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setMode('linkedin')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'linkedin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </button>
                                    <button
                                        onClick={() => setMode('pdf')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Upload PDF
                                    </button>
                                </div>

                                {mode === 'linkedin' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/in/username"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Resume PDF</label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-blue-600">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            {file ? (
                                                <div>
                                                    <p className="font-semibold text-gray-900">{file.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-medium text-gray-900">Click to upload PDF</p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF files only, max 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {error && <p className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                                <button
                                    onClick={handleImport}
                                    disabled={mode === 'linkedin' ? !url : !file}
                                    className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {mode === 'linkedin' ? 'Import & Generate' : 'Upload & Generate'}
                                </button>
                            </div>
                        )}

                        {(step === 'scraping' || step === 'generating') && (
                            <div className="text-center py-8">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                                <h4 className="font-semibold text-gray-900">
                                    {step === 'scraping' ? (mode === 'linkedin' ? 'Analyzing LinkedIn Profile...' : 'Reading PDF File...') : 'AI Writing Your Resume...'}
                                </h4>
                                <p className="text-sm text-gray-500 mt-2">This usually takes 10-20 seconds.</p>
                            </div>
                        )}

                        {step === 'done' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Resume Ready!</h4>
                                <p className="text-sm text-gray-500 mt-2">Redirecting to editor...</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
