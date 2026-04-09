'use client'

import { useState } from 'react'
import AssessmentSidebar from '@/components/AssessmentSidebar'
import RetakeModal from '@/components/RetakeModal'
import styles from './home-client.module.css'

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
    children: React.ReactNode
}

export default function HomeClient({ assessment, children }: Props) {
    const [showRetakeModal, setShowRetakeModal] = useState(false)

    const handleRetakeClick = () => {
        if (assessment) {
            setShowRetakeModal(true)
        }
    }

    return (
        <div className={styles.layout}>
            <div className={styles.main}>
                {children}
            </div>

            <AssessmentSidebar
                assessment={assessment}
                onRetake={handleRetakeClick}
            />

            {showRetakeModal && (
                <RetakeModal onClose={() => setShowRetakeModal(false)} />
            )}
        </div>
    )
}
