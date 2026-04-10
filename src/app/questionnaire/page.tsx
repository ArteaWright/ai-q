import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import QuestionnaireForm from '@/components/QuestionnaireForm'

export default async function QuestionnairePage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    return (
        <QuestionnaireForm
            userEmail={user.email ?? undefined}
            heading="AI Readiness Assessment"
            labels={{
                previous: 'Previous',
                continue: 'Continue',
                submit: 'Submit assessment',
            }}
            errors={{
                sectionIncomplete: 'Please answer all questions in this section before continuing.',
                assessmentIncomplete: 'Please answer all questions before submitting the assessment.',
            }}
        />
    )
}
