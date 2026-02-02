'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Home, LogOut, Crown, Zap, Briefcase, Settings, FileSearch, Mail, ChevronRight, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { UpgradeModal } from './upgrade-modal'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My CVs', href: '/dashboard/resumes', icon: FileText },
    { name: 'My Letters', href: '/dashboard/applications', icon: Mail },
    { name: 'Presentations', href: '/dashboard/presentations', icon: Presentation },
    { name: 'ATS Checker', href: '/dashboard/ats-checker', icon: FileSearch },
    { name: 'Optimize', href: '/dashboard/optimize', icon: Zap },
    { name: 'Find Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ user }: { user: any }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [showUpgrade, setShowUpgrade] = useState(false)

    // Check if user is pro (simulated via metadata)
    const isPro = user?.user_metadata?.plan === 'pro_annual'

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex h-full w-72 flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] relative z-10 font-sans">
            <div className="flex h-20 items-center px-6">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                        C
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-black/80 transition-colors">CVLink</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                    isActive
                                        ? 'bg-black text-white shadow-lg shadow-black/10'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 mt-auto">
                {!isPro && (
                    <Link href="/pricing" className="block relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-2xl p-5 text-white shadow-xl mb-6 group cursor-pointer hover:shadow-2xl transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                                    <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                                </div>
                                <h4 className="font-bold text-sm">Upgrade to Pro</h4>
                            </div>
                            <p className="text-xs text-gray-300 mb-4 leading-relaxed line-clamp-2">
                                Unlock unlimited AI credits and premium templates.
                            </p>
                            <div className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-lg text-center shadow-lg group-hover:bg-gray-100 transition-colors">
                                View Plans
                            </div>
                        </div>
                    </Link>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-gray-700 text-xs">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
    )
}
