'use client'

import { Question } from '@/lib/types'
import styles from './question-card.module.css'

interface QuestionCardProps {
    sectionId: string
    question: Question
    value: number | null
    onSelect: (questionId: string, value: number) => void
}

export default function QuestionCard({ sectionId, question, value, onSelect }: QuestionCardProps) {
    return (
        <article className={styles.card}>
            <h3 className={styles.questionText}>{question.text}</h3>
            <div className={styles.options}>
                {question.options?.map((option, index) => {
                    const selected = value === index
                    return (
                        <button
                            key={`${sectionId}-${question.id}-${index}`}
                            type="button"
                            className={`${styles.optionButton} ${selected ? styles.selected : ''}`}
                            onClick={() => onSelect(question.id, index)}
                            aria-pressed={selected}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>
        </article>
    )
}
