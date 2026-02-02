import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'

// Force dynamic since we check time
export const dynamic = 'force-dynamic'

export default async function PublicPresentationPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    const { data: presentation } = await supabase
        .from('presentations')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (!presentation) {
        notFound()
    }

    // 7-Day Expiration Logic
    if (!presentation.share_enabled_at) {
        redirect('/pricing')
    }

    const shareDate = new Date(presentation.share_enabled_at)
    const expiryDate = new Date(shareDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const now = new Date()

    if (now > expiryDate) {
        redirect('/pricing')
    }

    // Increment View Count (non-blocking)
    try {
        await supabase.rpc('increment_presentation_views', { row_id: presentation.id })
    } catch (e) {
        // Ignore view count errors
    }

    return (
        <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 bg-gray-900/50 backdrop-blur-md">
                <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">C</span>
                    CVLink Presents
                </div>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Powered by CVLink AI
                </Link>
            </div>

            {/* Slide Container - Simple Vertical Scroll for Public View for now (MVP) */}
            <div className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth">
                {presentation.content.map((slide: any, idx: number) => (
                    <div key={idx} className="h-screen snap-center w-full flex items-center justify-center p-8 relative">
                        {/* Slide Card */}
                        <div className="aspect-video w-full max-w-6xl bg-white text-gray-900 rounded-3xl shadow-2xl p-20 flex flex-col relative overflow-hidden">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                            <div className="relative z-10 flex-1 flex flex-col justify-center">
                                <h2 className="text-6xl font-bold mb-12 leading-tight tracking-tight">{slide.title}</h2>
                                <ul className="space-y-6">
                                    {slide.content?.map((point: string, i: number) => (
                                        <li key={i} className="text-3xl text-gray-600 flex items-start gap-4">
                                            <span className="w-3 h-3 mt-4 rounded-full bg-blue-600 shrink-0" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="absolute bottom-10 right-10 text-9xl font-bold text-gray-100 -z-0">
                                {idx + 1}
                            </div>
                        </div>

                        {/* Pagination Helper */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
                            <span className="text-xs font-bold uppercase tracking-widest">Scroll for next</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Expiry Warning */}
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-xs text-gray-400 px-3 py-1.5 rounded-full border border-gray-800 flex items-center gap-2">
                <Clock className="w-3 h-3 text-orange-500" />
                Valid until {expiryDate.toLocaleDateString()}
            </div>
        </div>
    )
}
