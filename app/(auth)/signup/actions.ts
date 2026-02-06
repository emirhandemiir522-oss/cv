'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })

    if (error) {
        if (error.message === 'User already registered') {
            return { error: 'An account with this email already exists. Please sign in instead.' }
        }
        return { error: error.message }
    }

    revalidatePath('/', 'layout')

    if (data.session) {
        redirect('/dashboard')
    }

    redirect('/login?message=Account created! Please log in.')
}
