'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils' // Assuming you might have a utils file from shadcn, if not I'll create one or define cn inline.
// I will define cn inline here to be safe if lib/utils doesn't exist yet, 
// OR I will assume I should create lib/utils first. 
// Standard shadcn creates lib/utils. NextJS default doesn't. 
// I'll create lib/utils.ts next. 

export function Navbar() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                        C
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">CVLink</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Pricing', 'Testimonials'].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}
