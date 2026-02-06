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
        const { data, error } = await supabase.auth.getUser()
        user = data.user

        if (!user && error) {
            const { data: sessionData } = await supabase.auth.getSession()
            user = sessionData.session?.user ?? null
        }
    } catch {
        const hasAuthCookies = request.cookies.getAll().some(
            cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
        )
        if (hasAuthCookies && isProtectedRoute) {
            return supabaseResponse
        }
    }

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
