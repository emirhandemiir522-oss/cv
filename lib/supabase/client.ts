import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return document.cookie.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          }).filter(cookie => cookie.name !== '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = []
            if (options?.maxAge) cookieOptions.push(`max-age=${options.maxAge}`)
            if (options?.path) cookieOptions.push(`path=${options.path}`)
            if (options?.domain) cookieOptions.push(`domain=${options.domain}`)
            if (options?.sameSite) cookieOptions.push(`samesite=${options.sameSite}`)
            if (options?.secure) cookieOptions.push('secure')

            const cookieString = `${name}=${value}${cookieOptions.length > 0 ? '; ' + cookieOptions.join('; ') : ''}`
            document.cookie = cookieString
          })
        }
      }
    }
  )
}
