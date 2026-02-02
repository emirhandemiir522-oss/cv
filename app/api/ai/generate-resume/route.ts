import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResume } from '@/lib/ai/openai'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { linkedinData, sourceText, title } = await request.json()

        // Generate resume with AI
        // This is also slow, might timeout on Vercel Free.
        const resumeData = await generateResume(linkedinData || sourceText)

        // Save to database
        const { data: resume, error } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                title: title || 'My Resume',
                base_resume_json: resumeData,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ resume })
    } catch (error: any) {
        console.error('Resume generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
