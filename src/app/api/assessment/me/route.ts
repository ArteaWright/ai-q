import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const auth = await requireAuth()
        if ('error' in auth) return auth.error
        const { user, supabase } = auth

        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found — not an error, user just has no assessment yet
            console.error('[assessment/me]', error)
            return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
        }

        return NextResponse.json({ assessment: data ?? null })
    } catch (error) {
        console.error('[assessment/me]', error)
        return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
    }
}
