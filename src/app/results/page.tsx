import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ResultsView from '@/components/ResultsView'

export default async function ResultsPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    return <ResultsView userEmail={user.email ?? undefined} />
}
