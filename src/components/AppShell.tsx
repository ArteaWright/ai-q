'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import AssessmentSidebar from '@/components/AssessmentSidebar'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import styles from './app-shell.module.css'

interface SectionScore {
    sectionId: string
    sectionName: string
    percentage: number
    readinessLevel: 'Low' | 'Medium' | 'High'
}

interface Assessment {
    overall_score: number
    overall_readiness_level: string
    section_scores: SectionScore[]
    recommendations: string
    completed_at: string
}

interface Props {
    assessment: Assessment | null
    isAuthenticated: boolean
    children: React.ReactNode
}

export default function AppShell({ assessment, isAuthenticated, children }: Props) {
    const [showRetakeModal, setShowRetakeModal] = useState(false)
    const router = useRouter()

    const handleRetake = () => {
        setShowRetakeModal(false)
        router.push('/questionnaire')
    }

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

            {isAuthenticated && <AssessmentSidebar
                assessment={assessment}
                onRetake={() => setShowRetakeModal(true)}
                onSignOut={handleSignOut}
                label="Your assessment"
                emptyState="No assessment found. Complete the questionnaire to see your results here."
                actions={{ download: 'Download recommendation', retake: 'Retake assessment', toggle: 'History' }}
            />}

            <Modal
                isOpen={showRetakeModal}
                onClose={() => setShowRetakeModal(false)}
                ariaLabel="Retake assessment"
            >
                <h2 className={styles.modalTitle}>Before you retake</h2>
                <p className={styles.modalBody}>
                    Retaking the assessment will permanently overwrite your previous results and recommendations.
                    Once you start, your previous report will no longer be available.
                </p>
                <p className={styles.modalHint}>
                    If you&apos;d like to keep a copy, download your PDF report before continuing.
                </p>
                <div className={styles.modalActions}>
                    <Button variant="secondary" onClick={() => setShowRetakeModal(false)}>
                        Go back
                    </Button>
                    <Button variant="primary" onClick={handleRetake}>
                        Retake anyway
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
