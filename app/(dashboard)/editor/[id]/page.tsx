'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Download, Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Award, FileText, ChevronDown, ChevronUp, Mail, Phone, MapPin, Linkedin, Upload, Image as ImageIcon, Share2, Eye, Copy, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { CoverLetterGenerator } from '@/components/editor/cover-letter-generator'

export default function EditorPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [resume, setResume] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showCoverLetter, setShowCoverLetter] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
    const supabase = createClient()

    useEffect(() => {
        loadResume()
    }, [])

    async function loadResume() {
        const { data } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (data) {
            // Ensure base_resume_json structure exists to avoid runtime errors
            if (!data.base_resume_json) data.base_resume_json = {}
            if (!data.base_resume_json.personalInfo) data.base_resume_json.personalInfo = {}
            if (!data.base_resume_json.experience) data.base_resume_json.experience = []
            if (!data.base_resume_json.education) data.base_resume_json.education = []
            if (!data.base_resume_json.skills) data.base_resume_json.skills = []
        }

        setResume(data)
        setLoading(false)
    }

    async function handleShare() {
        setSaving(true)
        const base = resume.base_resume_json

        // Generate slug if not exists
        if (!base.public_slug) {
            base.public_slug = `${base.personalInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'resume'}-${Math.random().toString(36).substring(2, 7)}`
        }

        // Renew expiration if expired, or set if new
        const now = new Date()
        const currentShareDate = base.share_enabled_at ? new Date(base.share_enabled_at) : null
        const expiryDate = currentShareDate ? new Date(currentShareDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null

        // If expired or not set, reset start time to now
        if (!expiryDate || now > expiryDate) {
            base.share_enabled_at = now.toISOString()
            base.public_views = 0 // Reset views on new share? Maybe keep them. Let's keep them for history, or reset? User usually expects reset if "new" link. Let's keep cumulative.
        }

        await supabase
            .from('resumes')
            .update({ base_resume_json: base })
            .eq('id', params.id)

        setResume({ ...resume, base_resume_json: base })
        setSaving(false)
        setShowShareModal(true)
    }

    async function saveResume() {
        setSaving(true)
        await supabase
            .from('resumes')
            .update({ base_resume_json: resume.base_resume_json })
            .eq('id', params.id)

        setTimeout(() => setSaving(false), 500)
    }

    async function handleDownload() {
        try {
            toast.promise(
                fetch(`/api/resumes/${params.id}/pdf`, { method: 'POST' })
                    .then(async (res) => {
                        if (!res.ok) throw new Error('Generation failed')
                        return res.json()
                    })
                    .then(({ url }) => {
                        window.open(url, '_blank')
                        return 'PDF Ready!'
                    }),
                {
                    loading: 'Generating PDF (this may take a few seconds)...',
                    success: (data) => data,
                    error: 'Failed to generate PDF'
                }
            )
        } catch (e) {
            console.error(e)
        }
    }

    const updateField = (section: string, field: string | null, value: any, index?: number) => {
        const newResume = { ...resume }
        const base = newResume.base_resume_json

        if (section === 'personalInfo') {
            base.personalInfo[field!] = value
        } else if (section === 'summary') {
            base.summary = value
        } else if (index !== undefined && Array.isArray(base[section])) {
            if (field) {
                base[section][index][field] = value
            } else {
                base[section][index] = value
            }
        }

        setResume(newResume)
    }

    const toggleExpand = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const addItem = (section: string) => {
        const newResume = { ...resume }
        const base = newResume.base_resume_json

        const newItem = section === 'experience' ? { title: 'New Role', company: '', description: '' } :
            section === 'education' ? { schoolName: 'New School', degreeName: '' } :
                'New Skill'

        base[section] = [newItem, ...(base[section] || [])]
        setResume(newResume)
        setExpandedSections(prev => ({ ...prev, [`${section}-0`]: true }))
    }

    const deleteItem = (section: string, index: number) => {
        const newResume = { ...resume }
        const base = newResume.base_resume_json
        base[section].splice(index, 1)
        setResume(newResume)
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            updateField('personalInfo', 'photo', reader.result)
        }
        reader.readAsDataURL(file)
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    )

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Award },
    ]

    return (
        <div className="flex h-screen flex-col bg-gray-100 overflow-hidden font-sans">
            {/* Topbar */}
            <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <input
                            value={resume?.title || ''}
                            onChange={(e) => setResume({ ...resume, title: e.target.value })}
                            className="font-bold text-gray-900 text-lg bg-transparent border-none focus:ring-0 p-0 hover:bg-gray-50 rounded px-2 -ml-2 transition-colors w-64"
                        />
                        <p className="text-xs text-gray-500 px-2 mt-0.5 flex items-center gap-1">
                            {saving ? 'Saving...' : 'All changes saved'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCoverLetter(!showCoverLetter)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${showCoverLetter ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Ai Cover Letter
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    <button
                        onClick={handleShare}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {resume?.base_resume_json?.public_views ? (
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold mr-1">
                                <Eye className="w-3 h-3" /> {resume.base_resume_json.public_views}
                            </span>
                        ) : null}
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>

                    <button
                        onClick={saveResume}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg hover:text-blue-600 transition-colors border border-gray-200"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Editor Body */}
            <div className="flex-1 flex overflow-hidden relative">
                {showCoverLetter && (
                    <div className="absolute top-4 left-4 z-30 w-96 shadow-2xl rounded-xl overflow-hidden">
                        <CoverLetterGenerator resume={resume} onGenerate={() => { }} />
                    </div>
                )}

                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-blue-600" />
                                    Share Resume
                                </h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Public Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${resume?.base_resume_json?.public_slug}`}
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/r/${resume?.base_resume_json?.public_slug}`
                                                navigator.clipboard.writeText(url)
                                                toast.success('Link copied to clipboard')
                                            }}
                                            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        Link is valid for <span className="font-semibold text-gray-700">7 days</span>.
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                                    <p className="font-semibold mb-1">How it works</p>
                                    <p className="opacity-90">
                                        Anyone with this link can view your resume. After 7 days, the link will expire and redirect to our secure payment portal.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left: Input Form */}
                <div className="w-1/2 flex bg-white border-r border-gray-200">
                    {/* Tabs */}
                    <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 gap-4 shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                                title={tab.label}
                            >
                                <tab.icon className="w-5 h-5" />
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
                        <div className="max-w-xl mx-auto pb-20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">{activeTab} Details</h2>

                            {activeTab === 'personal' && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="relative group w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                            {resume.base_resume_json.personalInfo.photo ? (
                                                <img src={resume.base_resume_json.personalInfo.photo} className="w-full h-full object-cover" alt="Profile" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <User className="w-8 h-8" />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Upload className="w-5 h-5 text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Profile Photo</p>
                                            <p className="text-sm text-gray-500">Upload a professional photo (optional).</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.name || ''}
                                                onChange={(e) => updateField('personalInfo', 'name', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Headline</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.headline || ''}
                                                onChange={(e) => updateField('personalInfo', 'headline', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="e.g. Senior Software Engineer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.email || ''}
                                                onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.phone || ''}
                                                onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.location || ''}
                                                onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="e.g. San Francisco, CA"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                                            <input
                                                value={resume.base_resume_json.personalInfo.linkedinUrl || ''}
                                                onChange={(e) => updateField('personalInfo', 'linkedinUrl', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-gray-900"
                                                placeholder="linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Summary</label>
                                    <textarea
                                        value={resume.base_resume_json.summary || ''}
                                        onChange={(e) => updateField('summary', null, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all min-h-[200px] leading-relaxed text-gray-900"
                                        placeholder="Briefly describe your professional background and key achievements..."
                                    />
                                </div>
                            )}

                            {/* Experience Tab */}
                            {activeTab === 'experience' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={() => addItem('experience')}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 mb-4"
                                    >
                                        <Plus className="w-4 h-4" /> Add Experience
                                    </button>

                                    {resume.base_resume_json.experience?.map((exp: any, i: number) => (
                                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer bg-white border-b border-gray-100"
                                                onClick={() => toggleExpand(`experience-${i}`)}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{exp.title || 'Untitled Role'}</h3>
                                                    <p className="text-sm text-gray-500">{exp.company || 'Unknown Company'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteItem('experience', i); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {expandedSections[`experience-${i}`] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>

                                            {expandedSections[`experience-${i}`] && (
                                                <div className="p-5 space-y-4 bg-gray-50/50">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Job Title</label>
                                                            <input
                                                                value={exp.title}
                                                                onChange={(e) => updateField('experience', 'title', e.target.value, i)}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company</label>
                                                            <input
                                                                value={exp.company}
                                                                onChange={(e) => updateField('experience', 'company', e.target.value, i)}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Range</label>
                                                            <input
                                                                value={exp.duration || ''}
                                                                onChange={(e) => updateField('experience', 'duration', e.target.value, i)}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                                placeholder="e.g. Jan 2020 - Present"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                                                        <textarea
                                                            value={Array.isArray(exp.description) ? exp.description.join('\n') : exp.description}
                                                            onChange={(e) => updateField('experience', 'description', e.target.value.split('\n'), i)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none min-h-[100px] text-gray-900"
                                                            placeholder="• Achieved X..."
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Education Tab */}
                            {activeTab === 'education' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={() => addItem('education')}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 mb-4"
                                    >
                                        <Plus className="w-4 h-4" /> Add Education
                                    </button>

                                    {resume.base_resume_json.education?.map((edu: any, i: number) => (
                                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer bg-white border-b border-gray-100"
                                                onClick={() => toggleExpand(`education-${i}`)}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{edu.schoolName || 'Unknown School'}</h3>
                                                    <p className="text-sm text-gray-500">{edu.degreeName || 'Degree'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteItem('education', i); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {expandedSections[`education-${i}`] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>
                                            {expandedSections[`education-${i}`] && (
                                                <div className="p-5 space-y-4 bg-gray-50/50">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">School</label>
                                                            <input
                                                                value={edu.schoolName}
                                                                onChange={(e) => updateField('education', 'schoolName', e.target.value, i)}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Degree</label>
                                                            <input
                                                                value={edu.degreeName}
                                                                onChange={(e) => updateField('education', 'degreeName', e.target.value, i)}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                                                            <input
                                                                value={edu.timePeriod?.endDate?.year || ''}
                                                                onChange={(e) => {
                                                                    const updated = { ...resume };
                                                                    if (!updated.base_resume_json.education[i].timePeriod) updated.base_resume_json.education[i].timePeriod = { endDate: {} };
                                                                    updated.base_resume_json.education[i].timePeriod.endDate.year = e.target.value;
                                                                    setResume(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none text-gray-900"
                                                                placeholder="e.g. 2024"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills Tab */}
                            {activeTab === 'skills' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={() => addItem('skills')}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 mb-6"
                                    >
                                        <Plus className="w-4 h-4" /> Add Skill
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        {resume.base_resume_json.skills?.map((skill: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 px-3 shadow-sm hover:border-blue-300 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                <input
                                                    value={typeof skill === 'string' ? skill : skill.name}
                                                    onChange={(e) => updateField('skills', null, e.target.value, i)}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-gray-900"
                                                />
                                                <button onClick={() => deleteItem('skills', i)} className="text-gray-300 hover:text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Live Preview (Enhanced) */}
                <div className="w-1/2 bg-gray-100 overflow-y-auto p-12 flex justify-center items-start">
                    <div id="preview-content" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top scale-[0.65] xl:scale-[0.80] transition-transform relative print:shadow-none print:scale-100 flex flex-col">

                        {/* Modern Layout - Two Columns */}
                        <div className="flex-1 flex flex-row h-full">
                            {/* Left Column (Dark/Colored) */}
                            <div className="w-[30%] bg-[#323b4c] text-white p-6 flex flex-col gap-8 h-auto min-h-full">
                                {/* Photo */}
                                <div className="flex justify-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg bg-gray-600">
                                        {resume.base_resume_json.personalInfo.photo ? (
                                            <img src={resume.base_resume_json.personalInfo.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/50">
                                                {resume.base_resume_json.personalInfo.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-600 pb-2">Contact</h3>
                                    <div className="space-y-3 text-[11px] font-medium opacity-90">
                                        {resume.base_resume_json.personalInfo.email && (
                                            <div className="flex items-center gap-2 break-all">
                                                <Mail className="w-3 h-3 shrink-0" />
                                                {resume.base_resume_json.personalInfo.email}
                                            </div>
                                        )}
                                        {resume.base_resume_json.personalInfo.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 shrink-0" />
                                                {resume.base_resume_json.personalInfo.phone}
                                            </div>
                                        )}
                                        {resume.base_resume_json.personalInfo.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {resume.base_resume_json.personalInfo.location}
                                            </div>
                                        )}
                                        {resume.base_resume_json.personalInfo.linkedinUrl && (
                                            <div className="flex items-center gap-2 break-all">
                                                <Linkedin className="w-3 h-3 shrink-0" />
                                                {resume.base_resume_json.personalInfo.linkedinUrl.replace('https://', '')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Education (Moved to Left) */}
                                {resume.base_resume_json.education?.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-600 pb-2">Education</h3>
                                        <div className="space-y-4">
                                            {resume.base_resume_json.education.map((edu: any, i: number) => (
                                                <div key={i} className="text-white">
                                                    <div className="font-bold text-sm mb-0.5">{edu.schoolName}</div>
                                                    <div className="text-[11px] opacity-75">{edu.degreeName}</div>
                                                    <div className="text-[10px] opacity-50 mt-1">{edu.timePeriod?.endDate?.year}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                {resume.base_resume_json.skills?.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-600 pb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resume.base_resume_json.skills.map((s: any, k: number) => (
                                                <span key={k} className="text-[11px] bg-white/10 px-2 py-1 rounded">
                                                    {typeof s === 'string' ? s : s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column (Main Content) */}
                            <div className="flex-1 p-8 text-gray-800">
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold text-[#323b4c] uppercase tracking-tight mb-2">
                                        {resume.base_resume_json.personalInfo.name || 'Your Name'}
                                    </h1>
                                    <p className="text-lg text-blue-600 font-medium uppercase tracking-widest">
                                        {resume.base_resume_json.personalInfo.headline || 'Professional Title'}
                                    </p>
                                </div>

                                {/* Summary */}
                                {resume.base_resume_json.summary && (
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#323b4c]">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-[#323b4c] uppercase tracking-wider text-sm">Profile</h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-gray-600 text-justify border-l-2 border-gray-200 pl-4">
                                            {resume.base_resume_json.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Experience */}
                                {resume.base_resume_json.experience?.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#323b4c]">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-[#323b4c] uppercase tracking-wider text-sm">Work Experience</h3>
                                        </div>

                                        <div className="space-y-6 border-l-2 border-gray-100 pl-4 ml-4">
                                            {resume.base_resume_json.experience.map((exp: any, i: number) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="font-bold text-gray-900 text-sm">{exp.title}</h4>
                                                        <span className="text-blue-600 text-xs font-bold">{exp.duration?.replace(' - ', ' – ')}</span>
                                                    </div>
                                                    <div className="text-gray-500 font-medium text-xs mb-2 uppercase tracking-wide">{exp.company}</div>
                                                    <div className="text-gray-600 leading-relaxed text-sm text-justify">
                                                        {typeof exp.description === 'string'
                                                            ? <div className="whitespace-pre-wrap">{exp.description}</div>
                                                            : <ul className="list-disc list-outside ml-3 space-y-1">
                                                                {exp.description?.map((d: string, j: number) => <li key={j}>{d}</li>)}
                                                            </ul>
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
