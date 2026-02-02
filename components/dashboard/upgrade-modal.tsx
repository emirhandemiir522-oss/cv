'use client'

import { useState } from 'react'
import { Check, Loader2, CreditCard, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

// We'll create a simple modal simulation since we don't have the full UI library setup for Dialog
// But let's build a custom modal component to avoid dependency issues

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm')
    const router = useRouter()

    const handleUpgrade = async () => {
        setLoading(true)
        setStep('processing')

        try {
            // Call the simulation API
            const res = await fetch('/api/subscription/upgrade', { method: 'POST' })
            if (!res.ok) throw new Error('Upgrade failed')

            // Simulate processing time
            setTimeout(() => {
                setStep('success')
                setLoading(false)
                router.refresh()
            }, 2000)
        } catch (error) {
            console.error(error)
            alert('Upgrade failed. Please try again.')
            setStep('confirm')
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {step === 'confirm' && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
                                <p className="text-sm text-gray-500">Unleash your full potential</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="font-bold text-blue-900 text-lg">Annual Plan</span>
                                <span className="font-bold text-blue-900 text-2xl">$70<span className="text-sm font-normal text-blue-600">/year</span></span>
                            </div>
                            <p className="text-xs text-blue-700">Billed annually. Cancel anytime.</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {[
                                'Unlimited Resume Versions',
                                'AI Content Optimization',
                                'Advanced ATS Checker',
                                'Priority Support'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpgrade}
                                className="flex-1 py-3 px-4 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                            >
                                Pay $70
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Secure payment processing
                        </p>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="p-12 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
                        <p className="text-gray-500 text-sm">Please do not close this window.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-12 text-center bg-green-50">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h3>
                        <p className="text-gray-600 mb-8">Your account has been successfully upgraded to the Annual Plan.</p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-200"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
