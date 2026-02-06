import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const pathname = request.nextUrl.pathname

    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/editor') ||
        pathname.startsWith('/optimize')

    const isAuthRoute = pathname === '/login' || pathname === '/signup'

    if (!isProtectedRoute && !isAuthRoute) {
        return supabaseResponse
    }

    let user = null

    try {
        const { data: userData } = await supabase.auth.getUser()
        user = userData?.user ?? null

        if (!user) {
            const { data: sessionData } = await supabase.auth.getSession()
            user = sessionData?.session?.user ?? null
        }
    } catch (error) {
        // Session check failed, skip user check
    }

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
