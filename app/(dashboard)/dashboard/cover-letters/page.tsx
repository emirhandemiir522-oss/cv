'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Calendar, Building, ArrowRight, Trash2, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CoverLettersPage() {
    const [letters, setLetters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadLetters()
    }, [])

    async function loadLetters() {
        // Fetch resumes where base_resume_json -> type == 'cover_letter'
        // Since Supabase filter on JSONB is tricky with simple client, we fetch resumes and filter manually or use contains if structure matches.
        // base_resume_json is JSONB. .contains('base_resume_json', { type: 'cover_letter' }) works!

        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .contains('base_resume_json', { type: 'cover_letter' })
            .order('created_at', { ascending: false })

        if (data) setLetters(data)
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this cover letter?')) return

        const { error } = await supabase.from('resumes').delete().eq('id', id)
        if (!error) {
            setLetters(letters.filter(l => l.id !== id))
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Motivasyon Mektuplarım</h1>
                    <p className="text-gray-500 mt-1">Manage all your tailored cover letters.</p>
                </div>
                <Link
                    href="/dashboard/jobs"
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Cover Letter
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
            ) : letters.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No cover letters yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">Create a tailored cover letter for your next job application using AI.</p>
                    <Link
                        href="/dashboard/jobs"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Find a job & generate one &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {letters.map((letter) => {
                        const data = letter.base_resume_json
                        const job = data.target_job
                        return (
                            <div key={letter.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col h-full">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <Building className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(letter.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1" title={job.title}>{job.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 font-medium">{job.company}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block font-medium border border-purple-100">
                                            {data.content.company_analysis ? 'AI Analyzed' : 'Draft'}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {data.generated_at ? new Date(data.generated_at).toLocaleDateString() : 'Recently'}
                                    </p>
                                </div>

                                <Link
                                    href={`/cover-letter/${letter.id}`}
                                    className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors group-hover:pl-5"
                                >
                                    View & Download PDF
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
