'use client'

import { useState } from 'react'
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Clock, Users, DollarSign, Sparkles, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GenerationModal } from '@/components/dashboard/generation-modal'

export default function JobFinderPage() {
    const [query, setQuery] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [jobs, setJobs] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)
    const [generatingJobId, setGeneratingJobId] = useState<number | null>(null)
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null)
    const [showGenerationModal, setShowGenerationModal] = useState(false)
    const router = useRouter()

    const handleGenerateCoverLetter = (job: any, index: number) => {
        setSelectedJob(job)
        setSelectedJobIndex(index)
        setShowGenerationModal(true)
    }

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        setSearched(true)
        setJobs([])
        setSelectedJobIndex(null) // Reset selection on new search

        try {
            const res = await fetch('/api/integrations/linkedin/jobs-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords: query.trim(), location: location.trim() }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs')

            if (Array.isArray(data.data)) {
                setJobs(data.data)
            } else {
                setJobs([])
            }

        } catch (err: any) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Briefcase className="w-8 h-8" />
                    Job Finder
                </h1>
                <p className="text-gray-500 mt-1">Search for jobs on LinkedIn and optimize your CV for them.</p>
            </div>

            {/* Search Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-lg"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Location (optional)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-2 justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search Jobs
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Powered by LinkedIn Jobs via Apify. Results may take 30-50 seconds.</p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Searching LinkedIn Jobs...</h3>
                    <p className="text-gray-500">This may take up to 20 seconds. Please wait.</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-red-600 max-w-md mx-auto">{error}</p>
                    <button
                        onClick={handleSearch}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* No Results */}
            {!loading && searched && jobs.length === 0 && !error && (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500">Try adjusting your search query or location.</p>
                </div>
            )}

            {/* Results */}
            {!loading && jobs.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">
                            Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                        </h2>
                    </div>

                    {jobs.map((job, i) => (
                        <div key={i}
                            className={`bg-white p-6 rounded-xl border transition-all group relative ${selectedJobIndex === i ? 'border-purple-600 shadow-purple-100 shadow-lg ring-1 ring-purple-600' : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'}`}
                        >
                            {selectedJobIndex === i && (
                                <div className="absolute top-4 right-4 bg-purple-600 text-white rounded-full p-1 z-10 hidden md:block">
                                    <div className="w-4 h-4 text-center leading-none flex items-center justify-center">✓</div>
                                </div>
                            )}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                        {job.title}
                                    </h3>
                                    <p className="text-gray-600 font-medium mt-1">{job.company}</p>

                                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                        )}
                                        {job.postedTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {job.postedTime}
                                            </span>
                                        )}
                                        {job.applicants && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applicants}
                                            </span>
                                        )}
                                        {job.salary && (
                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                <DollarSign className="w-4 h-4" />
                                                {job.salary}
                                            </span>
                                        )}
                                    </div>

                                    {job.description && (
                                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                            {job.description.substring(0, 200)}...
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 shrink-0">
                                    <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        Apply <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleGenerateCoverLetter(job, i)}
                                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate Kit
                                    </button>
                                    <Link
                                        href={`/dashboard/optimize?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}
                                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Optimize CV
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Initial State */}
            {!searched && !loading && (
                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Job Search</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Enter a job title or keywords above to find matching positions on LinkedIn.
                    </p>
                </div>
            )}

            {selectedJob && (
                <GenerationModal
                    isOpen={showGenerationModal}
                    onClose={() => setShowGenerationModal(false)}
                    job={selectedJob}
                />
            )}
        </div>
    )

}

