import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // SIMULATION: In a real app, this would be a Stripe Webhook handler.
        // Or we would redirect to Stripe Checkout here.
        // Since we are mocking it, we directly update the user metadata.

        const { error } = await supabase.auth.updateUser({
            data: {
                plan: 'pro_annual',
                billing_cycle: 'yearly',
                plan_start_date: new Date().toISOString(),
                plan_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }
        })

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Plan upgraded to Pro Annual' })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
