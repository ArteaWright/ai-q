'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import styles from './assessment-sidebar.module.css'

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
    onRetake: () => void
    onSignOut?: () => void
    label?: string
    emptyState?: string
    actions?: {
        download?: string
        retake?: string
        toggle?: string
        signOut?: string
    }
}

export default function AssessmentSidebar({
    assessment,
    onRetake,
    onSignOut,
    label = 'Your assessment',
    emptyState = 'No assessment found. Complete the questionnaire to see your results here.',
    actions = {},
}: Props) {
    const {
        download = 'Download recommendation',
        retake = 'Retake assessment',
        toggle = 'History',
        signOut = 'Sign out',
    } = actions
    const router = useRouter()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const handleViewResults = () => {
        if (!assessment) return
        const payload = {
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
        sessionStorage.setItem('pendingAssessment', JSON.stringify(payload))
        router.push('/results')
    }

    const formattedDate = assessment
        ? new Date(assessment.completed_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null

    const SidebarContent = () => (
        <div className={styles.content}>
            <p className={styles.sidebarLabel}>{label}</p>

            {!assessment ? (
                <p className={styles.empty}>{emptyState}</p>
            ) : (
                <>
                    <div className={styles.overallRow}>
                        <span className={styles.overallScore}>
                            {Math.round(assessment.overall_score)}%
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
                                <span className={`${styles.badge} ${styles[s.readinessLevel.toLowerCase()]}`}>
                                    {s.readinessLevel}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sidebarActions}>
                        <Button variant="primary" onClick={handleViewResults}>
                            {download}
                        </Button>
                        <Button variant="secondary" onClick={onRetake}>
                            {retake}
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
