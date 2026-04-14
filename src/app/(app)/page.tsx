import { getServerUser } from '@/utils/auth/helpers'
import LandingPage from '@/components/LandingPage'
import Nav from '@/components/Nav'
import HomeClient from './HomeClient'
import { DatabaseAssessment } from '@/lib/types'

export default async function HomePage() {
    const { user, supabase } = await getServerUser()

    if (!user) return <LandingPage />

    const { data: assessment } = await supabase
        .from('assessments')
        .select('overall_score, overall_readiness_level, section_scores, completed_at, recommendations')
        .eq('user_id', user.id)
        .single()

    return (
        <>
            <Nav />
            <HomeClient assessment={(assessment as DatabaseAssessment) ?? null} />
        </>
    )
}
