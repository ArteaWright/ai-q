import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/**
 * Reads the current session from Supabase cookies and returns the authenticated
 * user alongside a scoped Supabase client.
 *
 * Use this in server components and layouts that need the user but handle
 * missing auth themselves (e.g. render a landing page instead of redirecting).
 */
export async function getServerUser() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    return { user, supabase }
}

/**
 * Auth guard for API route handlers.
 * Returns `{ error }` with a 401 response if the request is not authenticated,
 * or `{ user, supabase }` if it is.
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if ('error' in auth) return auth.error
 *   const { user, supabase } = auth
 */
export async function requireAuth() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    return { user, supabase }
}
