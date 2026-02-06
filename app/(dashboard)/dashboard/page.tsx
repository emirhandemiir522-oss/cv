'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    Upload,
    FileText,
    CreditCard,
    TrendingUp,
    Layout,
    Zap,
    Loader2,
    ArrowRight,
    Briefcase,
    FileSearch,
    Crown,
    Plus,
    Activity
} from 'lucide-react'
import { ImportModal } from '@/components/dashboard/import-modal'
import { JobModal } from '@/components/dashboard/job-modal'
import { StatsCard } from '@/components/dashboard/stats-card'
import Link from 'next/link'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isJobOpen, setIsJobOpen] = useState(false)
    const [resumes, setResumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getData = async () => {
            console.log('🏠 Dashboard: Checking authentication...')

            try {
                const { data: { user }, error } = await supabase.auth.getUser()

                console.log('👤 Dashboard user check:', {
                    hasUser: !!user,
                    userId: user?.id,
                    email: user?.email,
                    error: error?.message
                })

                if (error) {
                    console.error('❌ Dashboard auth error:', error)
                    console.log('🔄 Redirecting to login...')
                    router.push('/login')
                    return
                }

                if (!user) {
                    console.log('⚠️ No user found, redirecting to login')
                    router.push('/login')
                    return
                }

                console.log('✅ User authenticated in dashboard')
                setUser(user)

                console.log('📊 Fetching user resumes...')
                const { data, error: resumesError } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (resumesError) {
                    console.error('❌ Error fetching resumes:', resumesError)
                } else {
                    console.log('📄 Resumes fetched:', data?.length || 0)
                    setResumes(data || [])
                }
            } catch (err) {
                console.error('💥 Dashboard getData error:', err)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }
        getData()
    }, [])

    const handleCreateBase = async () => {
        setCreating(true)
        try {
            const res = await fetch('/api/resumes/create', { method: 'POST' })
            const data = await res.json()
            if (res.ok && data.id) {
                router.push(`/editor/${data.id}`)
            }
        } catch (error) {
            console.error(error)
            setCreating(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header with Breadcrumb-like feel */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back, {user?.user_metadata?.full_name || 'User'}. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" /> Import
                    </button>
                    <button
                        onClick={handleCreateBase}
                        disabled={creating}
                        className="px-5 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20 flex items-center gap-2"
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create New
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Resumes"
                    value={resumes.length}
                    icon={FileText}
                    color="blue"
                    trend={{ value: "12% this week", isPositive: true }}
                />
                <StatsCard
                    title="Applications"
                    value="12"
                    icon={Briefcase}
                    color="purple"
                    trend={{ value: "3 pending", isPositive: true }}
                    description="Sent via CVLink"
                />
                <StatsCard
                    title="Profile Views"
                    value="148"
                    icon={Activity}
                    color="orange"
                    trend={{ value: "+24 today", isPositive: true }}
                />
                <StatsCard
                    title="Optimization Score"
                    value={resumes.length > 0 ? "92%" : "0%"}
                    icon={Zap}
                    color="green"
                    trend={{ value: "Top 5%", isPositive: true }}
                    description="Based on ATS metrics"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity & Documents */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Documents */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                            <Link href="/dashboard/resumes" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="p-2">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">No resumes yet</h3>
                                    <p className="text-gray-500 text-sm">Create your first resume to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {resumes.map((resume) => (
                                        <div key={resume.id} className="group flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer" onClick={() => router.push(`/editor/${resume.id}`)}>
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{resume.title || 'Untitled Resume'}</h3>
                                                <p className="text-sm text-gray-500 truncate">{resume.base_resume_json?.personalInfo?.headline || 'No headline added'}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-medium text-gray-400">Edited {new Date(resume.created_at).toLocaleDateString()}</p>
                                                <div className="flex items-center justify-end gap-1 text-green-600 text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <TrendingUp className="w-3 h-3" />
                                                    High ATS Score
                                                </div>
                                            </div>
                                            <div className="p-2 text-gray-300 group-hover:text-blue-600 transition-colors">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Promo */}
                <div className="space-y-6">
                    {/* Quick Tools */}
                    <div className="bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10" />

                        <h3 className="text-lg font-bold mb-6 relative z-10">Quick Tools</h3>
                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={() => setIsJobOpen(true)}
                                className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-4 transition-colors text-left border border-white/5 active:scale-95 duration-200"
                            >
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Job Search</h4>
                                    <p className="text-xs text-gray-400">Find and analyze listings</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard/ats-checker')}
                                className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-4 transition-colors text-left border border-white/5 active:scale-95 duration-200"
                            >
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-300">
                                    <FileSearch className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">ATS Checker</h4>
                                    <p className="text-xs text-gray-400">Validate your resume</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Pro Banner */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100 text-center">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-amber-900 mb-2">Upgrade to Pro</h3>
                        <p className="text-sm text-amber-800/70 mb-6">Get unlimited AI credits and priority support.</p>
                        <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                            View Plans
                        </button>
                    </div>
                </div>
            </div>

            <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
            <JobModal isOpen={isJobOpen} onClose={() => setIsJobOpen(false)} />
        </div>
    )
}
