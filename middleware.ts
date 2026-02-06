import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    console.log('🔒 Middleware triggered for:', request.nextUrl.pathname)

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
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('👤 Middleware user check:', {
        hasUser: !!user,
        userId: user?.id,
        pathname: request.nextUrl.pathname
    })

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/editor') ||
        request.nextUrl.pathname.startsWith('/optimize')

    const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

    if (isProtectedRoute && !user) {
        console.log('🚫 Protected route accessed without auth, redirecting to login')
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (isAuthRoute && user) {
        console.log('✅ Auth route accessed with existing session, redirecting to dashboard')
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    console.log('✅ Middleware check passed, continuing')
    return supabaseResponse
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup', '/editor/:path*', '/optimize/:path*'],
}
