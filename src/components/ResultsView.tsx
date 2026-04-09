'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssessmentScore, UserResponse } from '@/lib/types'
import Button from '@/components/Button'
import styles from './results-view.module.css'

interface StoredAssessment {
    scores: AssessmentScore
    responses: UserResponse[]
    fromHistory?: boolean
    cachedRecommendations?: string
}

interface Props {
    userEmail?: string
}

const READINESS_LABEL: Record<string, string> = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
}

export default function ResultsView({ userEmail }: Props) {
    const router = useRouter()
    const [assessment, setAssessment] = useState<StoredAssessment | null>(null)
    const [recommendations, setRecommendations] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const hasFetched = useRef(false)

    useEffect(() => {
        const raw = sessionStorage.getItem('pendingAssessment')
        if (!raw) {
            setError('No assessment found. Please complete the questionnaire first.')
            setLoading(false)
            return
        }

        const data: StoredAssessment = JSON.parse(raw)
        setAssessment(data)

        // Coming from history sidebar — use cached recommendations, no API call needed
        if (data.fromHistory && data.cachedRecommendations) {
            setRecommendations(data.cachedRecommendations)
            setLoading(false)
            return
        }

        if (hasFetched.current) return
        hasFetched.current = true

        fetch('/api/assessment/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Submission failed')
                return res.json()
            })
            .then(({ recommendations }) => {
                setRecommendations(recommendations)
                sessionStorage.removeItem('pendingAssessment')
            })
            .catch(() => setError('Failed to generate recommendations. Please try again.'))
            .finally(() => setLoading(false))
    }, [])

    const handleDownloadPDF = async () => {
        if (!assessment) return

        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        const margin = 20
        const pageWidth = doc.internal.pageSize.getWidth()
        const maxWidth = pageWidth - margin * 2
        let y = margin

        const addText = (text: string, size = 11, bold = false) => {
            doc.setFontSize(size)
            doc.setFont('helvetica', bold ? 'bold' : 'normal')
            const lines = doc.splitTextToSize(text, maxWidth) as string[]
            lines.forEach((line) => {
                if (y > 270) { doc.addPage(); y = margin }
                doc.text(line, margin, y)
                y += size * 0.45
            })
            y += 2
        }

        addText('AI Readiness Assessment Report', 18, true)
        addText(`Completed: ${new Date(assessment.scores.completedAt).toLocaleDateString()}`, 10)
        if (userEmail) addText(`User: ${userEmail}`, 10)
        y += 4

        addText('Overall Readiness', 14, true)
        addText(
            `${Math.round(assessment.scores.overallPercentage)}% — ${assessment.scores.overallReadinessLevel}`,
            12
        )
        y += 4

        addText('Section Scores', 14, true)
        assessment.scores.sectionScores.forEach((s) => {
            addText(`${s.sectionName}: ${Math.round(s.percentage)}% (${s.readinessLevel})`, 11)
        })
        y += 4

        if (recommendations) {
            addText('Recommendations', 14, true)
            addText(recommendations, 10)
        }

        doc.save('ai-readiness-report.pdf')
    }

    if (error && !assessment) {
        return (
            <div className={styles.container}>
                <p className={styles.errorMsg}>{error}</p>
                <Button variant="primary" onClick={() => router.push('/questionnaire')}>
                    Go to questionnaire
                </Button>
            </div>
        )
    }

    if (!assessment) return null

    const { scores } = assessment

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p className={styles.label}>Assessment complete</p>
                <h1 className={styles.heading}>Your AI Readiness Results</h1>
                {userEmail && <p className={styles.sub}>Signed in as {userEmail}</p>}
            </div>

            {/* Overall score */}
            <div className={styles.overallCard}>
                <div>
                    <p className={styles.overallLabel}>Overall readiness</p>
                    <p className={styles.overallLevel}>{scores.overallReadinessLevel}</p>
                </div>
                <span className={`${styles.overallPct} ${styles[scores.overallReadinessLevel.toLowerCase()]}`}>
                    {Math.round(scores.overallPercentage)}%
                </span>
            </div>

            {/* Section scores */}
            <div className={styles.sections}>
                {scores.sectionScores.map((s) => (
                    <div key={s.sectionId} className={styles.sectionCard}>
                        <div className={styles.sectionInfo}>
                            <span className={styles.sectionName}>{s.sectionName}</span>
                            <span className={`${styles.badge} ${styles[s.readinessLevel.toLowerCase()]}`}>
                                {READINESS_LABEL[s.readinessLevel]}
                            </span>
                        </div>
                        <div className={styles.barTrack}>
                            <div
                                className={`${styles.barFill} ${styles[s.readinessLevel.toLowerCase()]}`}
                                style={{ width: `${s.percentage}%` }}
                            />
                        </div>
                        <span className={styles.sectionPct}>{Math.round(s.percentage)}%</span>
                    </div>
                ))}
            </div>

            {/* Recommendations */}
            <div className={styles.recommendationsCard}>
                <h2 className={styles.recHeading}>Recommendations</h2>
                {loading ? (
                    <div className={styles.loadingState}>
                        <span className={styles.spinner} aria-hidden="true" />
                        <p>Generating recommendations…</p>
                    </div>
                ) : error ? (
                    <p className={styles.errorMsg}>{error}</p>
                ) : (
                    <pre className={styles.recText}>{recommendations}</pre>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <Button variant="secondary" onClick={() => router.push('/')}>
                    Back to home
                </Button>
                <Button variant="primary" onClick={handleDownloadPDF} disabled={loading || !recommendations}>
                    Download PDF report
                </Button>
            </div>
        </div>
    )
}
