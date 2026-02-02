'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Loader2, Presentation } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CreatePresentationPage() {
    const [topic, setTopic] = useState('')
    const [audience, setAudience] = useState('')
    const [tone, setTone] = useState('')
    const [generating, setGenerating] = useState(false)
    const router = useRouter()

    const handleGenerate = async () => {
        if (!topic.trim()) return toast.error('Please enter a topic')

        setGenerating(true)
        try {
            const res = await fetch('/api/presentations/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, audience, tone })
            })

            if (!res.ok) throw new Error('Generation failed')

            const data = await res.json()
            toast.success('Presentation generated!')
            router.push(`/dashboard/presentations/${data.id}`)
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <Link href="/dashboard/presentations" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Presentations
            </Link>

            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Presentation Builder</h1>
                <p className="text-gray-500">Describe your topic, and we'll design a professional slide deck for you in seconds.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-20 -mt-20 -z-10" />

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">What is your presentation about?</label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. The Future of Renewable Energy, Q3 Marketing Strategy, History of Rome..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all min-h-[100px] text-gray-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Target Audience</label>
                        <input
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g. Investors, Students"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900"
                        >
                            <option value="">Select Tone</option>
                            <option value="Professional">Professional</option>
                            <option value="Casual">Casual</option>
                            <option value="Inspiring">Inspiring</option>
                            <option value="Educational">Educational</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || !topic.trim()}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Slides...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Presentation
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
