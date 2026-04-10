'use client'

import styles from './questionnaire-progress.module.css'

interface Section {
    id: string
    name: string
    questionCount: number
}

interface Props {
    sections: Section[]
    currentSectionIndex: number
    totalAnswered: number
    totalQuestions: number
}

export default function QuestionnaireProgress({ sections, currentSectionIndex, totalAnswered, totalQuestions }: Props) {
    const fillPercent = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0

    let cumulative = 0
    const checkpoints = sections.slice(0, -1).map((section, i) => {
        cumulative += section.questionCount
        const at = (cumulative / totalQuestions) * 100
        return {
            id: section.id,
            name: section.name,
            at,
            // Complete when the user has moved past this section
            complete: currentSectionIndex > i,
        }
    })

    return (
        <div className={styles.wrapper}>
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${fillPercent}%` }} />
                {checkpoints.map((cp) => (
                    <div
                        key={cp.id}
                        className={`${styles.checkpoint} ${cp.complete ? styles.complete : ''}`}
                        style={{ left: `${cp.at}%` }}
                        title={`${cp.name} ${cp.complete ? '✓' : ''}`}
                        aria-label={`${cp.name} ${cp.complete ? 'complete' : 'incomplete'}`}
                    />
                ))}
            </div>
            <p className={styles.label}>{totalAnswered} of {totalQuestions} questions answered</p>
        </div>
    )
}
