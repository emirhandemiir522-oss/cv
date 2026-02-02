'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Presentation, Loader2, Calendar, MoreVertical, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PresentationsPage() {
    const [presentations, setPresentations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchPresentations() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('presentations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                setPresentations(data || [])
            }
            setLoading(false)
        }
        fetchPresentations()
    }, [])

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Presentations</h1>
                    <p className="text-gray-500 mt-1">Create and manage your AI-generated slide decks.</p>
                </div>
                <Link
                    href="/dashboard/presentations/create"
                    className="px-5 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Presentation
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
            ) : presentations.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl border border-gray-200 border-dashed p-16 text-center">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 text-purple-600">
                        <Presentation className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No presentations yet</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Generate your first professional slide deck with AI in seconds.
                    </p>
                    <Link
                        href="/dashboard/presentations/create"
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {presentations.map((pres) => (
                        <Link
                            key={pres.id}
                            href={`/dashboard/presentations/${pres.id}`}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-[280px]"
                        >
                            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex flex-col justify-center items-center text-center group-hover:scale-105 transition-transform duration-500">
                                <Presentation className="w-12 h-12 text-gray-300 mb-3 group-hover:text-purple-500 transition-colors" />
                                <h3 className="font-bold text-gray-900 line-clamp-2 px-4 group-hover:text-purple-700 transition-colors">{pres.title}</h3>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between bg-white relative z-10">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Generated</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(pres.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-purple-600 transition-colors">
                                        {pres.content?.length || 0} Slides
                                    </span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:text-purple-600 cursor-pointer">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
