import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const emptyResume = {
        personalInfo: {
            name: '',
            headline: '',
            email: user.email || '',
            phone: '',
            location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: []
    }

    const { data, error } = await supabase
        .from('resumes')
        .insert({
            user_id: user.id,
            title: 'Untitled Resume',
            base_resume_json: emptyResume
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
}
