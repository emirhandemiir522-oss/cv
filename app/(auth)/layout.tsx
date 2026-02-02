import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-black p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">C</div>
                    <span className="font-bold text-xl tracking-tight">CVLink</span>
                </Link>


            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-[400px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
