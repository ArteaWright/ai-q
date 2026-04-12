'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StoredAssessment } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { formatDate, formatPercentage, readinessClass } from '@/lib/formatting'
import Button from '@/components/Button'
import LoadingScreen from '@/components/LoadingScreen'
import styles from './results-view.module.css'

interface Props {
    userEmail?: string
    label?: string
    heading?: string
    overallLabel?: string
    recommendationsHeading?: string
    loadingText?: string
}

export default function ResultsView({
    userEmail,
    label = 'Assessment complete',
    heading = 'Your AI Readiness Results',
    overallLabel = 'Overall readiness',
    recommendationsHeading = 'Recommendations',
    loadingText = 'Generating recommendations…',
}: Props) {
    const router = useRouter()
    const [assessment, setAssessment] = useState<StoredAssessment | null>(null)
    const [recommendations, setRecommendations] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const hasFetched = useRef(false)

    useEffect(() => {
        const raw = sessionStorage.getItem(STORAGE_KEYS.PENDING_ASSESSMENT)
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
                sessionStorage.removeItem(STORAGE_KEYS.PENDING_ASSESSMENT)
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
        addText(`Completed: ${formatDate(assessment.scores.completedAt)}`, 10)
        if (userEmail) addText(`User: ${userEmail}`, 10)
        y += 4

        addText('Overall Readiness', 14, true)
        addText(
            `${formatPercentage(assessment.scores.overallPercentage)} — ${assessment.scores.overallReadinessLevel}`,
            12
        )
        y += 4

        addText('Section Scores', 14, true)
        assessment.scores.sectionScores.forEach((s) => {
            addText(`${s.sectionName}: ${formatPercentage(s.percentage)} (${s.readinessLevel})`, 11)
        })
        y += 4

        if (recommendations) {
            addText('Recommendations', 14, true)
            addText(recommendations, 10)
        }

        doc.save('ai-readiness-report.pdf')
    }

    if (loading) return <LoadingScreen text={loadingText} />

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
                <p className={styles.label}>{label}</p>
                <h1 className={styles.heading}>{heading}</h1>
                {userEmail && <p className={styles.sub}>Signed in as {userEmail}</p>}
            </div>

            {/* Overall score */}
            <div className={styles.overallCard}>
                <div>
                    <p className={styles.overallLabel}>{overallLabel}</p>
                    <p className={styles.overallLevel}>{scores.overallReadinessLevel}</p>
                </div>
                <span className={`${styles.overallPct} ${styles[readinessClass(scores.overallReadinessLevel)]}`}>
                    {formatPercentage(scores.overallPercentage)}
                </span>
            </div>

            {/* Section scores */}
            <div className={styles.sections}>
                {scores.sectionScores.map((s) => (
                    <div key={s.sectionId} className={styles.sectionCard}>
                        <div className={styles.sectionInfo}>
                            <span className={styles.sectionName}>{s.sectionName}</span>
                            <span className={`${styles.badge} ${styles[readinessClass(s.readinessLevel)]}`}>
                                {s.readinessLevel}
                            </span>
                        </div>
                        <div className={styles.barTrack}>
                            <div
                                className={`${styles.barFill} ${styles[readinessClass(s.readinessLevel)]}`}
                                style={{ width: `${s.percentage}%` }}
                            />
                        </div>
                        <span className={styles.sectionPct}>{formatPercentage(s.percentage)}</span>
                    </div>
                ))}
            </div>

            {/* Recommendations */}
            <div className={styles.recommendationsCard}>
                <h2 className={styles.recHeading}>{recommendationsHeading}</h2>
                {error ? (
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
