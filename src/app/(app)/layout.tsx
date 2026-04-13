import { getServerUser } from '@/utils/auth/helpers'
import AppShell from '@/components/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, supabase } = await getServerUser()

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
