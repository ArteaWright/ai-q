import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import AppShell from '@/components/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    const assessment = user
        ? await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', user.id)
            .single()
            .then(({ data }) => data ?? null)
        : null

    return (
        <AppShell assessment={assessment} isAuthenticated={!!user}>
            {children}
        </AppShell>
    )
}
