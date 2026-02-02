'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Share2, Download, MonitorPlay, Edit3, X, Copy, Clock, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function PresentationEditorPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [presentation, setPresentation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [isEditing, setIsEditing] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('presentations')
                .select('*')
                .eq('id', params.id)
                .single()
            setPresentation(data)
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async () => {
        await supabase
            .from('presentations')
            .update({ content: presentation.content, title: presentation.title })
            .eq('id', params.id)
        toast.success('Saved!')
        setIsEditing(false)
    }

    const handleDownloadPPTX = async () => {
        // Dynamic import to avoid SSR issues
        const pptxgen = (await import('pptxgenjs')).default
        const pres = new pptxgen()

        presentation.content.forEach((slide: any) => {
            const s = pres.addSlide()
            s.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' })

            if (slide.content && Array.isArray(slide.content)) {
                s.addText(slide.content.map((c: string) => ({ text: c, options: { breakLine: true } })), { x: 0.5, y: 1.5, fontSize: 14, color: '666666', bullet: true })
            }

            if (slide.speakerNotes) {
                s.addNotes(slide.speakerNotes)
            }
        })

        pres.writeFile({ fileName: `${presentation.title}.pptx` })
        toast.success('Downloaded PPTX')
    }

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>

    const currentSlide = presentation.content[currentSlideIndex]

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Sidebar - Slide List */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                    <Link href="/dashboard/presentations" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-sm truncate flex-1">{presentation.title}</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {presentation.content.map((slide: any, idx: number) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`p-3 rounded-xl border border-gray-200 cursor-pointer transition-all hover:border-purple-400 ${currentSlideIndex === idx ? 'ring-2 ring-purple-500 border-transparent bg-purple-50' : 'bg-gray-50'}`}
                        >
                            <span className="text-xs font-bold text-gray-400 mb-1 block">Slide {idx + 1}</span>
                            <p className="text-xs font-semibold text-gray-900 truncate">{slide.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                            {currentSlideIndex + 1} / {presentation.content.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isEditing ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Edit3 className="w-4 h-4" />
                            {isEditing ? 'Editing' : 'Edit'}
                        </button>
                        <button onClick={handleSave} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button onClick={() => setShowShare(true)} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button onClick={handleDownloadPPTX} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg">
                            <Download className="w-4 h-4" />
                            .PPTX
                        </button>
                    </div>
                </div>

                {/* Slide Preview */}
                <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto">
                    <div className="aspect-video w-full max-w-5xl bg-white shadow-2xl rounded-xl p-16 flex flex-col relative transition-all duration-300">
                        {isEditing ? (
                            <div className="space-y-6 w-full">
                                <input
                                    value={currentSlide.title}
                                    onChange={(e) => {
                                        const newContent = [...presentation.content]
                                        newContent[currentSlideIndex].title = e.target.value
                                        setPresentation({ ...presentation, content: newContent })
                                    }}
                                    className="text-4xl font-bold text-gray-900 w-full border-b border-dashed border-gray-300 focus:border-purple-500 outline-none pb-2 bg-transparent"
                                />
                                <div className="space-y-2">
                                    {(currentSlide.content || []).map((point: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-purple-500 font-bold">•</span>
                                            <input
                                                value={point}
                                                onChange={(e) => {
                                                    const newContent = [...presentation.content]
                                                    newContent[currentSlideIndex].content[idx] = e.target.value
                                                    setPresentation({ ...presentation, content: newContent })
                                                }}
                                                className="flex-1 text-xl text-gray-600 border-b border-dashed border-gray-200 focus:border-purple-500 outline-none bg-transparent"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">{currentSlide.title}</h2>
                                <ul className="space-y-4">
                                    {(currentSlide.content || []).map((point: string, idx: number) => (
                                        <li key={idx} className="text-2xl text-gray-600 flex items-start gap-3">
                                            <span className="block w-2 h-2 mt-3 rounded-full bg-purple-500 shrink-0" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                                <div className="absolute bottom-8 right-8 text-gray-300 font-bold text-8xl opacity-20 pointer-events-none">
                                    {currentSlideIndex + 1}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShare && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-purple-600" /> Share Presentation
                            </h3>
                            <button onClick={() => setShowShare(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-600 truncate flex-1">
                                {`${window.location.origin}/p/${presentation.slug}`}
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/p/${presentation.slug}`)
                                    toast.success('Copied!')
                                }}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Copy className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 p-3 rounded-lg">
                            <Clock className="w-4 h-4" />
                            This link expires in 7 days.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
