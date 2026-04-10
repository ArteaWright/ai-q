'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DatabaseAssessment, StoredAssessment } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { formatDate, formatPercentage, readinessClass } from '@/lib/formatting'
import Button from '@/components/Button'
import styles from './assessment-sidebar.module.css'

interface Props {
    assessment: DatabaseAssessment | null
    onSignOut?: () => void
    label?: string
    emptyState?: string
    actions?: {
        download?: string
        toggle?: string
        signOut?: string
    }
}

export default function AssessmentSidebar({
    assessment,
    onSignOut,
    label = 'Your assessment',
    emptyState = 'No assessment found. Complete the questionnaire to see your results here.',
    actions = {},
}: Props) {
    const {
        download = 'Download recommendation',
        toggle = 'History',
        signOut = 'Sign out',
    } = actions
    const router = useRouter()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const handleViewResults = () => {
        if (!assessment) return

        // Transform the snake_case DB row into the camelCase shape the results
        // page expects, then flag it as a history view so no API call is made.
        const payload: StoredAssessment = {
            scores: {
                overallPercentage: assessment.overall_score,
                overallReadinessLevel: assessment.overall_readiness_level,
                sectionScores: assessment.section_scores,
                completedAt: assessment.completed_at,
            },
            responses: [],
            fromHistory: true,
            cachedRecommendations: assessment.recommendations,
        }
        sessionStorage.setItem(STORAGE_KEYS.PENDING_ASSESSMENT, JSON.stringify(payload))
        router.push('/results')
    }

    const formattedDate = assessment ? formatDate(assessment.completed_at) : null

    const SidebarContent = () => (
        <div className={styles.content}>
            <p className={styles.sidebarLabel}>{label}</p>

            {!assessment ? (
                <p className={styles.empty}>{emptyState}</p>
            ) : (
                <>
                    <div className={styles.overallRow}>
                        <span className={styles.overallScore}>
                            {formatPercentage(assessment.overall_score)}
                        </span>
                        <div>
                            <p className={styles.overallLevel}>{assessment.overall_readiness_level} readiness</p>
                            <p className={styles.date}>Completed {formattedDate}</p>
                        </div>
                    </div>

                    <div className={styles.sections}>
                        {assessment.section_scores.map((s) => (
                            <div key={s.sectionId} className={styles.sectionRow}>
                                <span className={styles.sectionName}>{s.sectionName}</span>
                                <span className={`${styles.badge} ${styles[readinessClass(s.readinessLevel)]}`}>
                                    {s.readinessLevel}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sidebarActions}>
                        <Button variant="primary" onClick={handleViewResults}>
                            {download}
                        </Button>
                    </div>
                </>
            )}

            {onSignOut && (
                <div className={styles.signOutRow}>
                    <Button variant="secondary" onClick={onSignOut}>
                        {signOut}
                    </Button>
                </div>
            )}
        </div>
    )

    return (
        <>
            {/* Mobile toggle button */}
            <Button
                className={styles.drawerToggle}
                variant="secondary"
                size="small"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open assessment history"
            >
                {toggle}
            </Button>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
                    <aside
                        className={styles.drawer}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Assessment history"
                    >
                        <button
                            className={styles.drawerClose}
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className={styles.sidebar} aria-label="Assessment history">
                <SidebarContent />
            </aside>
        </>
    )
}
