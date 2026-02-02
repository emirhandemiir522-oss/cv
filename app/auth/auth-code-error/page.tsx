import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg text-center">
                <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
                <p className="text-gray-600">
                    There was a problem verifying your identity. The link may have expired or is invalid.
                </p>
                <div className="mt-6">
                    <Link
                        href="/login"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
