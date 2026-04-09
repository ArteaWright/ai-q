'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import questionnaireData from '@/lib/questionnaire.json'
import { calculateOverallScore } from '@/lib/scoring'
import { Questionnaire, UserResponse } from '@/lib/types'
import Button from '@/components/Button'
import QuestionCard from '@/components/QuestionCard'
import ProgressBar from '@/components/ProgressBar'
import styles from './questionnaire-form.module.css'

const questionnaire = questionnaireData as Questionnaire

interface QuestionnaireFormProps {
    userEmail?: string
}

export default function QuestionnaireForm({ userEmail: _userEmail }: QuestionnaireFormProps) {
    const router = useRouter()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, number | null>>(() => {
        const initial: Record<string, number | null> = {}
        questionnaire.sections.forEach((section) => {
            section.questions.forEach((question) => {
                initial[question.id] = null
            })
        })
        return initial
    })
    const [error, setError] = useState('')

    const currentSection = questionnaire.sections[currentSectionIndex]
    const totalQuestions = questionnaire.sections.reduce((total, section) => total + section.questions.length, 0)
    const answeredCount = useMemo(
        () => Object.values(responses).filter((value) => value !== null).length,
        [responses]
    )

    const currentSectionAnswered = useMemo(
        () => currentSection.questions.filter((question) => responses[question.id] !== null).length,
        [currentSection, responses]
    )

    const sectionComplete = currentSection.questions.every((question) => responses[question.id] !== null)
    const allComplete = answeredCount === totalQuestions

    const handleSelect = (questionId: string, value: number) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }))
        setError('')
    }

    const handlePrevious = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1)
            setError('')
        }
    }

    const handleNext = () => {
        if (!sectionComplete) {
            setError('Please answer all questions in this section before continuing.')
            return
        }

        if (currentSectionIndex < questionnaire.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1)
            setError('')
        }
    }

    const handleSubmit = () => {
        if (!allComplete) {
            setError('Please answer all questions before submitting the assessment.')
            return
        }

        const userResponses: UserResponse[] = questionnaire.sections.flatMap((section) =>
            section.questions.map((question) => ({
                sectionId: section.id,
                questionId: question.id,
                response: responses[question.id] ?? 0,
            }))
        )

        const scores = calculateOverallScore(questionnaire.sections, userResponses)
        sessionStorage.setItem('pendingAssessment', JSON.stringify({ scores, responses: userResponses }))
        router.push('/results')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <p className={styles.sectionLabel}>Section {currentSectionIndex + 1} of {questionnaire.sections.length}</p>
                    <h1 className={styles.heading}>AI Readiness Assessment</h1>
                    <p className={styles.sectionDescription}>{currentSection.description}</p>
                </div>
                <div className={styles.progressGroup}>
                    <ProgressBar current={answeredCount} max={totalQuestions} label={`${answeredCount} of ${totalQuestions} answered`} />
                    <ProgressBar current={currentSectionAnswered} max={currentSection.questions.length} label={`${currentSectionAnswered} of ${currentSection.questions.length} in this section`} />
                </div>
            </div>

            <div className={styles.questions}>
                {currentSection.questions.map((question) => (
                    <QuestionCard
                        key={question.id}
                        sectionId={currentSection.id}
                        question={question}
                        value={responses[question.id]}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={handlePrevious} disabled={currentSectionIndex === 0}>
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    onClick={currentSectionIndex === questionnaire.sections.length - 1 ? handleSubmit : handleNext}
                >
                    {currentSectionIndex === questionnaire.sections.length - 1 ? 'Submit assessment' : 'Continue'}
                </Button>
            </div>

        </div>
    )
}
