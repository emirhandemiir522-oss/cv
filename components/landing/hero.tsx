'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle, FileText, Sparkles } from 'lucide-react'

export function Hero() {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/20 blur-[100px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Resume Optimization</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900"
                >
                    Land Your Dream Job with <br className="hidden md:block" />
                    <span className="text-blue-600">Perfectly Tailored CVs</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Import your LinkedIn profile and let our AI generate ATS-optimized resumes for every job application. Increase your interview chances by 3x.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/signup"
                        className="min-w-[200px] h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/30 group"
                    >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/demo"
                        className="min-w-[200px] h-12 flex items-center justify-center rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        View Example
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    {/* Mockup Container */}
                    <div className="rounded-xl bg-gray-900/5 p-4 backdrop-blur-sm border border-gray-200/50">
                        <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200 bg-white">
                            {/* Mockup Header */}
                            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="ml-4 h-6 w-64 bg-white border border-gray-200 rounded text-xs flex items-center px-2 text-gray-400">cvlink.app/editor</div>
                            </div>
                            {/* Mockup Content */}
                            <div className="p-8 grid grid-cols-2 gap-8 h-[400px]">
                                <div className="space-y-4">
                                    <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                                    <div className="space-y-2 pt-4">
                                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6 flex flex-col justify-center items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">AI Optimization</h3>
                                    <p className="text-sm text-gray-600">Analyzing job description matching keywords...</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                        <CheckCircle className="w-4 h-4" />
                                        95% Match Score
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating elements */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 md:right-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Hired!</p>
                                <p className="text-xs text-gray-500">Google • Senior Engineer</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
