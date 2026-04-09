import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

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
