'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Download, Printer, Mail, Phone, MapPin, Linkedin, Link as urlIcon } from 'lucide-react'
import Link from 'next/link'

export default function CoverLetterViewPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [letter, setLetter] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadLetter()
    }, [])

    async function loadLetter() {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (data) setLetter(data)
        setLoading(false)
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    )

    if (!letter) return <div>Not found</div>

    const content = letter.base_resume_json.content
    const job = letter.base_resume_json.target_job
    const personal = letter.base_resume_json.personalInfo || { name: 'Your Name' } // Fallback, actually we should save personal info in snapshot or fetch current resume

    // Since we didn't snapshot personal info in api route (oops), we rely on current user resume?
    // Wait, the API route used `resume` from DB to generate content. BUT it didn't save personal info in the Cover Letter JSON.
    // We should probably fetch the latest resume of the user again OR update API.
    // For now, let's fetch user's latest resume to fill header.
    // OR we can just check if letter.base_resume_json has personal info... wait, in route.ts we only saved type, target_job, content.
    // Correction: Frontend needs personal info for the header.
    // I will fetch the user's main resume.

    return <LetterViewer letter={letter} />
}

function LetterViewer({ letter }: { letter: any }) {
    const supabase = createClient()
    const [userInfo, setUserInfo] = useState<any>(null)

    useEffect(() => {
        // Fetch user resume for contact details
        supabase.from('resumes')
            .select('base_resume_json')
            .eq('user_id', letter.user_id)
            .neq('base_resume_json->>type', 'cover_letter')
            .order('created_at', { ascending: false })
            .limit(1)
            .then(({ data }) => {
                if (data && data[0]) setUserInfo(data[0].base_resume_json.personalInfo)
            })
    }, [letter])

    const job = letter.base_resume_json.target_job
    const content = letter.base_resume_json.content

    // Parse Date
    const dateStr = new Date(letter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className="bg-gray-100 min-h-screen font-serif flex flex-col print:bg-white print:h-auto print:min-h-0">
            {/* Toolbar - Hidden in Print */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/cover-letters" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-900">{job.company} Cover Letter</h1>
                        <p className="text-xs text-gray-500">Generated on {dateStr}</p>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            {/* A4 Paper */}
            <div className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible flex justify-center">
                <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] relative mx-auto print:shadow-none print:w-full print:mx-0 text-gray-800 leading-relaxed text-[11pt]">

                    {/* Header: Personal Info */}
                    {userInfo && (
                        <header className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-2 font-sans">{userInfo.name}</h1>
                                <p className="text-lg text-gray-600 font-medium font-sans">{userInfo.headline}</p>
                            </div>
                            <div className="text-right text-sm space-y-1 text-gray-600 font-sans">
                                {userInfo.email && <div className="flex items-center justify-end gap-2">{userInfo.email}</div>}
                                {userInfo.phone && <div className="flex items-center justify-end gap-2">{userInfo.phone}</div>}
                                {userInfo.location && <div className="flex items-center justify-end gap-2">{userInfo.location}</div>}
                                {userInfo.linkedinUrl && <div className="flex items-center justify-end gap-2 text-blue-600">{userInfo.linkedinUrl.replace('https://', '')}</div>}
                            </div>
                        </header>
                    )}

                    {/* Date & Recipient */}
                    <div className="mb-8">
                        <p className="mb-6 font-bold text-gray-500 text-sm uppercase tracking-wider">{dateStr}</p>

                        <div className="mb-2 font-bold text-gray-900 text-lg">Hiring Manager</div>
                        <div className="text-gray-700">{job.company}</div>
                        {job.logo && <img src={job.logo} className="h-8 object-contain mt-2 opacity-80" alt={job.company} />}
                    </div>

                    {/* Body Content */}
                    <div
                        className="space-y-4 text-justify prose prose-gray max-w-none prose-p:leading-relaxed prose-li:marker:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: content.body || '' }}
                    />

                    {/* Signature */}
                    <div className="mt-16">
                        <p className="mb-4">Sincerely,</p>
                        {userInfo && (
                            <div>
                                <p className="font-bold text-lg font-script text-gray-900 signature">{userInfo.name}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                }
                .font-script { font-family: 'Brush Script MT', cursive; }
            `}</style>
        </div>
    )
}
