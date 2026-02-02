'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileSearch, Loader2, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react'

export default function ATSCheckerPage() {
    const [resumes, setResumes] = useState<any[]>([])
    const [selectedResume, setSelectedResume] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        loadResumes()
    }, [])

    async function loadResumes() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('resumes')
                .select('id, title, base_resume_json')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            setResumes(data || [])
            if (data && data.length > 0) {
                setSelectedResume(data[0].id)
            }
        }
        setLoading(false)
    }

    async function runATSCheck() {
        if (!selectedResume) return
        setAnalyzing(true)
        setResult(null)

        const resume = resumes.find(r => r.id === selectedResume)
        if (!resume) return

        try {
            const res = await fetch('/api/ai/ats-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: resume.base_resume_json })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setResult(data.data)
        } catch (error: any) {
            console.error(error)
            alert('ATS Check failed: ' + error.message)
        } finally {
            setAnalyzing(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
            case 'critical': return <XCircle className="w-5 h-5 text-red-500" />
            default: return null
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <FileSearch className="w-8 h-8" />
                    ATS Compatibility Checker
                </h1>
                <p className="text-gray-500 mt-1">
                    Analyze your resume for Applicant Tracking System compatibility and get personalized improvement suggestions.
                </p>
            </div>

            {/* Resume Selection */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Select a Resume to Analyze</h2>

                {resumes.length === 0 ? (
                    <p className="text-gray-500">No resumes found. Please create one first.</p>
                ) : (
                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            value={selectedResume}
                            onChange={(e) => setSelectedResume(e.target.value)}
                            className="flex-1 max-w-md px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none"
                        >
                            {resumes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>

                        <button
                            onClick={runATSCheck}
                            disabled={analyzing || !selectedResume}
                            className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Run ATS Check
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Overall Score */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-8 flex items-center gap-8">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${getScoreColor(result.overallScore)}`}>
                                <div className="text-center">
                                    <div className="text-4xl font-bold">{result.overallScore}</div>
                                    <div className="text-xs font-medium uppercase tracking-wide opacity-70">/ 100</div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Compatibility Score</h2>
                                <p className="text-gray-500 mb-4">
                                    {result.overallScore >= 80
                                        ? 'Excellent! Your resume is well-optimized for ATS systems.'
                                        : result.overallScore >= 60
                                            ? 'Good, but there\'s room for improvement.'
                                            : 'Needs significant improvements to pass ATS filters.'}
                                </p>
                                <button
                                    onClick={runATSCheck}
                                    className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline"
                                >
                                    <RefreshCw className="w-4 h-4" /> Re-analyze
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Category Breakdown</h3>
                        <div className="space-y-4">
                            {result.categories?.map((cat: any, i: number) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(cat.status)}
                                            <span className="font-bold text-gray-900">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-600">{cat.score} / {cat.maxScore}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                        <div
                                            className={`h-2 rounded-full transition-all ${cat.status === 'good' ? 'bg-green-500' : cat.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600">{cat.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Improvements */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            Top Improvements
                        </h3>
                        <ul className="space-y-3">
                            {result.topImprovements?.map((imp: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</div>
                                    <p className="text-purple-900">{imp}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Missing Elements */}
                    {result.missingElements?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Missing Elements
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missingElements.map((el: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200">
                                        {el}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
