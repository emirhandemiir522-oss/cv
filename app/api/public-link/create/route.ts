import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { resumeVersionId } = await request.json()

        // Check ownership
        /* In a real app we'd verify user owns the resume_version via join */

        const slug = nanoid(10) // Generate unique 10-char slug

        const { data, error } = await supabase
            .from('shared_links')
            .insert({
                resume_version_id: resumeVersionId,
                public_path: slug,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${slug}`, slug })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
