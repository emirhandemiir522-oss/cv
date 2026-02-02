import Link from 'next/link'
import { Clock, FileText, ArrowRight, ShieldCheck } from 'lucide-react'

export default function ExpiredPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">This Link Has Expired</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    The public access to this CV link has ended. For security and privacy, shared links are valid for 7 days only.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="block w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Create Your Own CV
                    </Link>

                    <Link
                        href="/"
                        className="block w-full py-3.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                        Return Home
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-400">
                    <div className="flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        Secure & Private
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        ATS Friendly
                    </div>
                </div>
            </div>
        </div>
    )
}
