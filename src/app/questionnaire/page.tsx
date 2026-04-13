import { redirect } from 'next/navigation'
import { getServerUser } from '@/utils/auth/helpers'
import QuestionnaireForm from '@/components/QuestionnaireForm'

export default async function QuestionnairePage() {
    const { user } = await getServerUser()
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
