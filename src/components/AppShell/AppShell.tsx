'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { DatabaseAssessment } from '@/lib/types'
import AssessmentSidebar from '@/components/AssessmentSidebar'
import styles from './app-shell.module.css'

interface Props {
    assessment: DatabaseAssessment | null
    isAuthenticated: boolean
    children: React.ReactNode
}

export default function AppShell({ assessment, isAuthenticated, children }: Props) {
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className={styles.layout}>
            <div className={styles.main}>
                {children}
            </div>

            {isAuthenticated && (
                <AssessmentSidebar
                    assessment={assessment}
                    onSignOut={handleSignOut}
                    label="Your assessment"
                    emptyState="No assessment found. Complete the questionnaire to see your results here."
                    actions={{ download: 'Download recommendation', toggle: 'History' }}
                />
            )}
        </div>
    )
}
