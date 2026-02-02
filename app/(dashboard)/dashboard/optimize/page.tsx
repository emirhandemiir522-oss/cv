'use client'

import { useState } from 'react'
import { Briefcase, Building, Link as LinkIcon, Sparkles, Loader2, ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OptimizePage() {
    const [title, setTitle] = useState('')
    const [company, setCompany] = useState('')
    const [jobUrl, setJobUrl] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleAutoFill = async () => {
        if (!jobUrl) return
        setLoading(true)
        try {
            const res = await fetch('/api/integrations/linkedin/job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobUrl }),
            })
            const data = await res.json()
            if (res.ok && data.data) {
                const job = data.data
                setTitle(job.title || '')
                setCompany(job.companyName || '')
                setDescription(job.description || job.descriptionHtml || '')
            } else {
                alert('Could not extract job details. Please fill manually.')
            }
        } catch (error) {
            console.error(error)
            alert('Failed to fetch job data')
        } finally {
            setLoading(false)
        }
    }

    const handleOptimize = async () => {
        if (!title || !description) {
            alert('Please fill in Job Title and Description')
            return
        }
        setAnalyzing(true)
        setResult(null)

        try {
            // 1. Get current user's latest resume
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: resumes } = await supabase
                .from('resumes')
                .select('base_resume_json')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            const currentResume = resumes?.[0]?.base_resume_json
            if (!currentResume) {
                alert('Please create a resume first.')
                return
            }

            // 2. Call Analyze API
            const res = await fetch('/api/ai/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobDescription: `Title: ${title}\nCompany: ${company}\nDescription: ${description}`,
                    currentResume
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setResult(data.data)

        } catch (error: any) {
            console.error(error)
            alert('Optimization failed: ' + error.message)
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-black" />
                    Job Optimization
                </h1>
                <p className="text-gray-500 mt-1">Paste a job description to tailor your CV specifically for that role.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Left Column: Job Details */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Job Details</h2>
                    <p className="text-sm text-gray-500 mb-6">Tell us about the role you are applying for.</p>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="e.g. Google"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job URL (Optional)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/jobs/..."
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleAutoFill}
                                    disabled={loading || !jobUrl}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                                    title="Auto-fill details from URL"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownCircle className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Paste a LinkedIn Job URL and click the arrow to auto-fill (uses Apify).</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Job Description */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Job Description</h2>
                    <p className="text-sm text-gray-500 mb-4">Paste the full job description here.</p>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste job description..."
                        className="flex-1 w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                </div>
            </div>

            <div className="flex justify-center mb-16">
                <button
                    onClick={handleOptimize}
                    disabled={analyzing || !title || !description}
                    className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 disabled:transform-none"
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            Optimize My CV
                        </>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${result.matchScore >= 70 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                {result.matchScore}%
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Match Score</h2>
                                <p className="text-gray-500">How well your CV matches this job.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" /> Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords?.map((kw: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" /> Suggested Professional Summary
                                </h3>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900 leading-relaxed">
                                    {result.suggestedSummary}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Improvement Suggestions
                                </h3>
                                <ul className="space-y-3">
                                    {result.improvements?.map((imp: any, i: number) => (
                                        <li key={i} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                                            <div>
                                                <span className="font-bold text-gray-900 block text-sm mb-1">{imp.section}</span>
                                                <p className="text-gray-600 text-sm">{imp.suggestion}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
