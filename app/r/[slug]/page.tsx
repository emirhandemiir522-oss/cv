import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Briefcase, GraduationCap, Award, MapPin, Mail, Phone, Linkedin, Calendar } from 'lucide-react'

export default async function PublicPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    // 1. Fetch Resume by Slug (Using JSON containment operator for efficiency if possible, or filter)
    // Note: In a real prod app with millions of rows, we need a dedicated column/table. 
    // Here we assume low volume or rely on Supabase's JSON filtering capabilities.

    // We try to find a resume where base_resume_json contains the public_slug
    const { data: resumes, error } = await supabase
        .from('resumes')
        .select('*')
        // Supabase operator to filter inside JSONB column specifically for a key-value pair
        // This syntax assumes base_resume_json is a top-level JSONB column
        .contains('base_resume_json', { public_slug: params.slug })

    if (error || !resumes || resumes.length === 0) {
        notFound()
    }

    const resume = resumes[0]
    const baseData = resume.base_resume_json

    // 2. Check Expiration (7 Days)
    if (!baseData.share_enabled_at) {
        redirect('/pricing')
    }

    const shareDate = new Date(baseData.share_enabled_at)
    const expiryDate = new Date(shareDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const now = new Date()

    if (now > expiryDate) {
        redirect('/pricing')
    }

    // 3. Increment View Count (Fire and forget, don't block render)
    // We need to fetch latest first to avoid overwrite race conditions strictly speaking, but for MVP:
    const newViews = (baseData.public_views || 0) + 1
    const updatedData = { ...baseData, public_views: newViews }

    await supabase
        .from('resumes')
        .update({ base_resume_json: updatedData })
        .eq('id', resume.id)

    // Render Resume
    const { personalInfo, experience, education, skills, summary } = updatedData

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 print:p-0 print:bg-white flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row print:shadow-none print:w-full">

                {/* Left Column (Dark) */}
                <div className="w-full md:w-[35%] bg-[#2c3e50] text-white p-8 flex flex-col gap-8 print:w-[35%] print:bg-[#2c3e50] print:text-white">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-4 bg-gray-600">
                            {personalInfo?.photo ? (
                                <img src={personalInfo.photo} className="w-full h-full object-cover" alt={personalInfo.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/50">
                                    {personalInfo?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-wider mb-1">{personalInfo?.name}</h2>
                        <p className="text-sm font-medium text-blue-200">{personalInfo?.headline}</p>
                    </div>

                    <div className="space-y-4 text-sm opacity-90">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-600 pb-2 mb-4">Contact</h3>

                        {personalInfo?.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 shrink-0" />
                                <span className="break-all">{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 shrink-0" />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo?.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>{personalInfo.location}</span>
                            </div>
                        )}
                        {personalInfo?.linkedinUrl && (
                            <div className="flex items-center gap-3">
                                <Linkedin className="w-4 h-4 shrink-0" />
                                <span className="break-all">{personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                            </div>
                        )}
                    </div>

                    {education && education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-600 pb-2 mb-4">Education</h3>
                            <div className="space-y-4">
                                {education.map((edu: any, i: number) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold">{edu.schoolName}</div>
                                        <div className="text-white/80">{edu.degreeName}</div>
                                        <div className="text-white/50 text-xs mt-0.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {edu.timePeriod?.endDate?.year}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {skills && skills.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-600 pb-2 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill: any, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">
                                        {typeof skill === 'string' ? skill : skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Light) */}
                <div className="w-full md:w-[65%] p-10 text-gray-800 print:w-[65%]">
                    {summary && (
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-4 border-b-2 border-gray-100 pb-2">Profile</h3>
                            <p className="text-gray-600 leading-relaxed text-justify">
                                {summary}
                            </p>
                        </div>
                    )}

                    {experience && experience.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-6 border-b-2 border-gray-100 pb-2">Experience</h3>
                            <div className="space-y-8">
                                {experience.map((exp: any, i: number) => (
                                    <div key={i} className="relative pl-6 border-l-2 border-gray-200">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#2c3e50] border-4 border-white"></div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{exp.duration?.replace('-', '–')}</span>
                                        </div>
                                        <div className="text-gray-500 font-semibold mb-3 uppercase tracking-wide text-sm">{exp.company}</div>
                                        <div className="text-gray-600 text-sm leading-relaxed">
                                            {Array.isArray(exp.description) ? (
                                                <ul className="list-disc ml-4 space-y-1">
                                                    {exp.description.map((d: string, k: number) => (
                                                        <li key={k}>{d}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{exp.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-6 right-6 print:hidden">
                <Link
                    href="/dashboard/resumes"
                    className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <Briefcase className="w-4 h-4" />
                    Create Your Own CV
                </Link>
            </div>
        </div>
    )
}
