import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    console.log('🔗 Auth callback triggered')

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('📋 Callback params:', { hasCode: !!code, next, origin })

    if (code) {
        try {
            const supabase = await createClient()
            console.log('🔄 Exchanging code for session...')

            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            console.log('📥 Exchange result:', {
                hasSession: !!data?.session,
                hasUser: !!data?.user,
                error: error?.message
            })

            if (!error) {
                console.log('✅ Session exchanged successfully, redirecting to:', next)
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                console.error('❌ Exchange failed:', error)
            }
        } catch (err) {
            console.error('💥 Exchange catch error:', err)
        }
    } else {
        console.log('⚠️ No code provided in callback URL')
    }

    // return the user to an error page with instructions
    console.log('🔄 Redirecting to error page')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
