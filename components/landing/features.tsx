'use client'

import { Zap, Target, FileText, Share2, Sparkles, LayoutList } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
    {
        name: 'LinkedIn Import',
        description: 'Transform your LinkedIn profile into a professional resume in seconds with one click.',
        icon: LayoutList,
    },
    {
        name: 'AI Optimization',
        description: 'Our AI analyzes job descriptions and tailors your resume keywords to pass ATS filters.',
        icon: Sparkles,
    },
    {
        name: 'Cover Letter Generator',
        description: 'Generate personalized cover letters that match your resume and the job you are applying for.',
        icon: FileText,
    },
    {
        name: 'ATS Score Check',
        description: 'Get an instant score on how well your resume matches a specific job posting.',
        icon: Target,
    },
    {
        name: 'Live Preview',
        description: 'See changes in real-time with our split-screen editor and instant PDF export.',
        icon: Zap,
    },
    {
        name: 'Shareable Links',
        description: 'Create unique public links for your resume to share directly with recruiters.',
        icon: Share2,
    },
]

export function Features() {
    return (
        <div className="py-24 bg-white sm:py-32 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">Faster Hired</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need for your job search
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Stop wasting hours formatting word documents. CVLink handles the design and content optimization so you can focus on interviewing.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative pl-16 group"
                            >
                                <dt className="text-base font-semibold leading-7 text-gray-900 group-hover:text-blue-600 transition-colors">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors">
                                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                            </motion.div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}
