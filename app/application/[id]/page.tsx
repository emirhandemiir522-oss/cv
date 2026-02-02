'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Download, Printer, Presentation, MessageSquare, FileText, ChevronDown, ChevronUp, Share2, Copy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApplicationKitPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [kit, setKit] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'slides' | 'qa' | 'letter'>('slides')
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadKit()
    }, [])

    // Sync editedContent when kit loads
    useEffect(() => {
        if (kit) setEditedContent(kit.base_resume_json.content)
    }, [kit])

    async function loadKit() {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (data) setKit(data)
        if (!data) router.push('/dashboard/applications')
        setLoading(false)
    }

    async function handleSave() {
        if (!editedContent) return

        const { error } = await supabase
            .from('resumes')
            .update({
                base_resume_json: {
                    ...kit.base_resume_json,
                    content: editedContent
                }
            })
            .eq('id', kit.id)

        if (error) {
            alert('Failed to save changes')
        } else {
            setKit({ ...kit, base_resume_json: { ...kit.base_resume_json, content: editedContent } })
            setIsEditing(false)
        }
    }

    // Helper to update specific slide
    const updateSlide = (index: number, field: string, value: any) => {
        const newSlides = [...editedContent.slides]
        newSlides[index] = { ...newSlides[index], [field]: value }
        setEditedContent({ ...editedContent, slides: newSlides })
    }

    // Helper to update specific QA
    const updateQA = (index: number, field: string, value: any) => {
        const newQA = [...editedContent.qa]
        newQA[index] = { ...newQA[index], [field]: value }
        setEditedContent({ ...editedContent, qa: newQA })
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    )

    if (!kit) return null

    const content = kit.base_resume_json.content
    const job = kit.base_resume_json.target_job

    // Fallback for legacy cover letters (if user opens one here)
    if (!content.slides && content.body) {
        // Redirect to legacy viewer or render just letter
        // For better UX, let's render just letter tab active
        if (activeTab !== 'letter') setActiveTab('letter')
    }

    const { slides, qa, cover_letter } = content

    return (
        <div className="min-h-screen bg-gray-100 font-sans print:bg-white">

            {/* Header / Toolbar (Hidden on Print) */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/applications" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-900">{job.company} Application Kit</h1>
                        <p className="text-xs text-gray-500">{job.title}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {slides && (
                        <button
                            onClick={() => setActiveTab('slides')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'slides' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Presentation className="w-4 h-4" /> Presentation
                        </button>
                    )}
                    {qa && (
                        <button
                            onClick={() => setActiveTab('qa')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'qa' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Interview Q&A
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('letter')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'letter' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <FileText className="w-4 h-4" /> Cover Letter
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm"
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Edit Content
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 max-w-5xl mx-auto print:p-0 print:max-w-none">

                {/* 1. SLIDES VIEW */}
                {(activeTab === 'slides' || typeof window !== 'undefined' && window.matchMedia('print').matches /* Only separate logic doesn't work well with React hydration, rely on CSS */) && editedContent?.slides && (
                    <div className={activeTab === 'slides' ? 'block' : 'hidden print:block'}>
                        <div className="space-y-12 print:space-y-0">
                            {editedContent.slides.map((slide: any, i: number) => (
                                <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden aspect-video border border-gray-200 flex flex-col relative print:break-before-page print:shadow-none print:border-none print:aspect-auto print:h-screen print:rounded-none">
                                    {/* Slide Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                                        {isEditing ? (
                                            <input
                                                value={slide.title}
                                                onChange={(e) => updateSlide(i, 'title', e.target.value)}
                                                className="text-3xl font-bold bg-transparent border-b border-white/20 w-full outline-none text-white placeholder-white/50"
                                            />
                                        ) : (
                                            <h2 className="text-3xl font-bold">{slide.title}</h2>
                                        )}
                                    </div>

                                    {/* Slide Body */}
                                    <div className="p-10 flex-1 flex flex-col justify-center bg-white">
                                        <div className="grid grid-cols-3 gap-8 h-full">
                                            {/* Text Content */}
                                            <div className="col-span-2 space-y-6">
                                                <ul className="space-y-4">
                                                    {slide.bullets?.map((bull: string, b: number) => (
                                                        <li key={b} className="flex items-start gap-3 text-xl text-gray-700 leading-relaxed">
                                                            <span className="w-3 h-3 bg-blue-500 rounded-full mt-2.5 shrink-0" />
                                                            {isEditing ? (
                                                                <input
                                                                    value={bull}
                                                                    onChange={(e) => {
                                                                        const newBullets = [...slide.bullets]
                                                                        newBullets[b] = e.target.value
                                                                        updateSlide(i, 'bullets', newBullets)
                                                                    }}
                                                                    className="flex-1 bg-transparent border-b border-gray-200 outline-none focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                <span dangerouslySetInnerHTML={{ __html: bull.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Visual Placeholder (User would insert image here in real deck) */}
                                            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center p-6 text-center text-gray-400">
                                                <div>
                                                    <p className="font-semibold text-gray-500 mb-2">Visual Concept:</p>
                                                    <p className="text-sm italic">"{slide.visual_cue}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm print:hidden">
                                        <span>Slide {i + 1} / {editedContent.slides.length}</span>
                                        <div className="flex gap-2 items-center flex-1 ml-8">
                                            <span className="font-bold shrink-0">Speaker Notes:</span>
                                            {isEditing ? (
                                                <input
                                                    value={slide.speaker_notes}
                                                    onChange={(e) => updateSlide(i, 'speaker_notes', e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-300 outline-none text-gray-600 text-xs"
                                                />
                                            ) : (
                                                <span className="truncate">{slide.speaker_notes}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Print Footer */}
                                    <div className="hidden print:flex fixed bottom-0 left-0 right-0 p-8 justify-between text-gray-400">
                                        <span>{job.company} Application - {kit.base_resume_json.personalInfo?.name || 'Candidate'}</span>
                                        <span>Page {i + 2}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Q&A VIEW */}
                {(activeTab === 'qa' || typeof window !== 'undefined' /* CSS handles print visibility */) && editedContent?.qa && (
                    <div className={activeTab === 'qa' ? 'block' : 'hidden print:block print:break-before-page'}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                                Interview Preparation & Q&A
                            </h2>
                            <p className="text-gray-500 mb-8">AI-predicted questions tailored for {job.company} and suggested answers based on your background.</p>

                            <div className="space-y-6">
                                {editedContent.qa.map((item: any, i: number) => (
                                    <div key={i} className="border border-gray-100 rounded-xl bg-gray-50/50 overflow-hidden">
                                        <div className="p-4 bg-white border-b border-gray-100 font-bold text-lg text-gray-900">
                                            {isEditing ? (
                                                <input
                                                    value={item.question}
                                                    onChange={(e) => updateQA(i, 'question', e.target.value)}
                                                    className="w-full font-bold bg-transparent outline-none focus:bg-gray-50 p-1 rounded"
                                                />
                                            ) : (
                                                <span>{i + 1}. {item.question}</span>
                                            )}
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">Suggested Answer</span>
                                                {isEditing ? (
                                                    <textarea
                                                        value={item.suggested_answer}
                                                        onChange={(e) => updateQA(i, 'suggested_answer', e.target.value)}
                                                        className="w-full min-h-[100px] p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                                    />
                                                ) : (
                                                    <p className="text-gray-700 leading-relaxed">{item.suggested_answer}</p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 block">Rationale (Why they ask this)</span>
                                                <p className="text-sm text-gray-500 italic">{item.rationale}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. COVER LETTER VIEW */}
                {(activeTab === 'letter' || typeof window !== 'undefined') && (
                    <div className={activeTab === 'letter' ? 'block' : 'hidden print:block print:break-before-page'}>
                        {/* Reusing the A4 style from the previous viewer */}
                        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] relative mx-auto print:shadow-none print:w-full print:mx-0 text-gray-800 leading-relaxed text-[11pt]">
                            {isEditing ? (
                                <textarea
                                    value={editedContent?.cover_letter?.body || editedContent?.body} // Fallback support
                                    onChange={(e) => setEditedContent({ ...editedContent, cover_letter: { ...editedContent.cover_letter, body: e.target.value } })}
                                    className="w-full h-[800px] p-4 bg-gray-50 border border-gray-200 rounded-lg outline-none font-serif resize-none"
                                />
                            ) : (
                                <div
                                    className="space-y-4 text-justify prose prose-gray max-w-none"
                                    dangerouslySetInnerHTML={{ __html: (editedContent?.cover_letter?.body || editedContent?.body || '').replace(/\n/g, '<br/>') }}
                                />
                            )}
                        </div>
                    </div>
                )}

            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print\\:break-before-page { break-before: page; }
                    .print\\:h-screen { height: 100vh; }
                }
            `}</style>
        </div>
    )
}
