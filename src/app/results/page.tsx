import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-helpers'
import ResultsView from '@/components/ResultsView'

export default async function ResultsPage() {
    const { user } = await getServerUser()
    if (!user) redirect('/auth/login')

    return (
        <ResultsView
            userEmail={user.email ?? undefined}
            label="Assessment complete"
            heading="Your AI Readiness Results"
            overallLabel="Overall readiness"
            recommendationsHeading="Recommendations"
            loadingText="Generating recommendations…"
        />
    )
}
