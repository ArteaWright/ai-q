'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { DatabaseAssessment, StoredAssessment } from '@/lib/types'
import { SCROLL_CARDS } from '@/lib/data/scroll-cards'
import { formatDate, formatPercentage, readinessClass } from '@/utils/formatting'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import Nav from '@/components/Nav'
import styles from './home-client.module.css'

interface Props {
    assessment: DatabaseAssessment | null
}

export default function HomeClient({ assessment }: Props) {
    const [showRetakeModal, setShowRetakeModal] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleViewResults = () => {
        if (!assessment) return
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

    const handleRetakeConfirm = () => {
        setShowRetakeModal(false)
        router.push('/questionnaire')
    }

    const handleCtaClick = () => {
        if (assessment) {
            setShowRetakeModal(true)
        } else {
            router.push('/questionnaire')
        }
    }

    return (
        <>
            <Nav hasAssessment={!!assessment} onCtaClick={handleCtaClick} />
            <main className={styles.main}>
                <div className={styles.container}>

                    {/* Left Card */}
                    <Card className={styles.leftCard}>
                        <div className={styles.leftContent}>
                            <div className={styles.leftTop}>
                                <h1 className={styles.title}>AI-Q</h1>
                                <p className={styles.description}>
                                    Evaluate your AI readiness with AI-Q, the AI readiness assessment tool.
                                </p>
                                <div className={styles.sectionCard}>
                                    <h2 className={styles.sectionTitle}>Data Readiness</h2>
                                    <p className={styles.sectionText}>
                                        Discover how well your business manages data, quality, governance, and reporting.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.leftActions}>
                                {assessment ? (
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => setShowRetakeModal(true)}
                                    >
                                        Retake assessment
                                    </button>
                                ) : (
                                    <Link href="/questionnaire" className={styles.actionButton}>
                                        Start assessment
                                    </Link>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Middle Card — Scroll */}
                    <Card
                        scrollable
                        cards={SCROLL_CARDS}
                        className={styles.middleCard}
                        border="1px solid rgba(195, 106, 58, 0.25)"
                    />

                    {/* Right Card — Assessment */}
                    <Card className={`${styles.rightCard} ${assessment ? styles.mobileFirst : ''}`}>
                        <div className={styles.rightContent}>
                            <p className={styles.panelLabel}>Your assessment</p>

                            {!assessment ? (
                                <p className={styles.emptyState}>
                                    No assessment yet. Complete the questionnaire to see your results here.
                                </p>
                            ) : (
                                <>
                                    <div className={styles.scoreRow}>
                                        <span className={styles.score}>
                                            {formatPercentage(assessment.overall_score)}
                                        </span>
                                        <div>
                                            <p className={`${styles.level} ${styles[readinessClass(assessment.overall_readiness_level)]}`}>
                                                {assessment.overall_readiness_level} readiness
                                            </p>
                                            <p className={styles.date}>
                                                Completed {formatDate(assessment.completed_at)}
                                            </p>
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

                                    <Button variant="primary" onClick={handleViewResults}>
                                        Download recommendation
                                    </Button>
                                </>
                            )}

                            <div className={styles.signOutRow}>
                                <Button variant="secondary" onClick={handleSignOut}>
                                    Sign out
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            {/* Retake Modal */}
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
                    <Button variant="primary" onClick={handleRetakeConfirm}>
                        Retake anyway
                    </Button>
                </div>
            </Modal>
        </>
    )
}
