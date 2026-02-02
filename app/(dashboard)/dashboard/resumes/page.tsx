'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, ArrowRight, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResumesPage() {
    const [resumes, setResumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                setResumes(data || [])
            }
            setLoading(false)
        }
        getData()
    }, [])

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/resumes/create', { method: 'POST' })
            const data = await res.json()
            if (res.ok && data.id) {
                router.push(`/editor/${data.id}`)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to create resume')
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My CVs</h1>
                    <p className="text-gray-500 mt-1">Manage all your resume versions.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New CV
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
            ) : resumes.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 text-gray-400">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900">No resumes yet</h3>
                    <p className="text-gray-500 text-sm mt-1 mb-6">Create your first resume to get started.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {resumes.map((resume) => (
                        <Link href={`/editor/${resume.id}`} key={resume.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 block relative">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 truncate">{resume.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{resume.base_resume_json?.personalInfo?.headline || 'No headline'}</p>

                            <div className="flex items-center justify-between text-xs font-medium text-gray-400 border-t border-gray-50 pt-4 mt-2">
                                <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                                <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
