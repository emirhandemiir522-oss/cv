import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const adminSupabase = createAdminClient()

        // Delete user's resumes explicitly if strictly needed (cascade works usually)
        // const { error: dbError } = await adminSupabase.from('resumes').delete().eq('user_id', user.id)
        // if (dbError) console.error('Error deleting resumes:', dbError)

        // Delete user from Auth
        const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

        if (error) {
            console.error('Delete User Error:', error)
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
