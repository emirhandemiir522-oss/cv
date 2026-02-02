import { Pricing6 } from '@/components/ui/pricing-6'
import { Navbar } from '@/components/landing/navbar' // Assuming Navbar exists or I can just use a simple header/back button
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="absolute top-6 left-6 z-10">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>

            <div className="pt-20">
                <Pricing6
                    heading="Unlock Your Career Potential"
                    description="The shared CV you are trying to access has expired. Choose a plan to create your own professional CV and share it with the world."
                    price={70}
                    priceSuffix="/year"
                    features={[
                        ["Unlimited AI Optimizations", "PDF Exports", "Public Sharing Links"],
                        ["ATS Score Analysis", "Cover Letter Generator", "Priority Support"],
                        ["7-Day Free Trial", "Cancel Anytime", "Secure Payment"]
                    ]}
                    buttonText="Upgrade Now"
                />
            </div>

            <footer className="text-center py-8 text-gray-500 text-sm">
                <p>© 2024 CVLink. All rights reserved.</p>
            </footer>
        </div>
    )
}
