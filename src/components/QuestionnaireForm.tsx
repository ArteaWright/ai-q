'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import questionnaireData from '@/lib/questionnaire.json'
import { calculateOverallScore } from '@/lib/scoring'
import { Questionnaire, UserResponse } from '@/lib/types'
import Button from '@/components/Button'
import QuestionCard from '@/components/QuestionCard'
import QuestionnaireProgress from '@/components/QuestionnaireProgress'
import styles from './questionnaire-form.module.css'

const questionnaire = questionnaireData as Questionnaire
const STORAGE_KEY = 'questionnaire-progress'

interface QuestionnaireFormProps {
    userEmail?: string
    heading?: string
    labels?: {
        previous?: string
        continue?: string
        submit?: string
    }
    errors?: {
        sectionIncomplete?: string
        assessmentIncomplete?: string
    }
}

interface SavedProgress {
    responses: Record<string, number | null>
    currentSectionIndex: number
    currentQuestionIndex: number
}

export default function QuestionnaireForm({
    userEmail: _userEmail,
    heading: _heading,
    labels = {},
    errors = {},
}: QuestionnaireFormProps) {
    const {
        previous = 'Previous',
        continue: continueLabel = 'Continue',
        submit = 'Submit assessment',
    } = labels
    const {
        assessmentIncomplete = 'Please answer all questions before submitting the assessment.',
    } = errors

    const router = useRouter()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
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
    const [initialized, setInitialized] = useState(false)

    // Restore saved progress on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const { responses: savedResponses, currentSectionIndex: si, currentQuestionIndex: qi }: SavedProgress = JSON.parse(saved)
                const hasAnswers = Object.values(savedResponses).some((v) => v !== null)
                if (hasAnswers) {
                    setResponses((prev) => ({ ...prev, ...savedResponses }))
                    setCurrentSectionIndex(si)
                    setCurrentQuestionIndex(qi)
                }
            }
        } catch {
            // ignore corrupted data
        }
        setInitialized(true)
    }, [])

    // Save progress after initialization so we don't overwrite restored state
    useEffect(() => {
        if (!initialized) return
        const progress: SavedProgress = { responses, currentSectionIndex, currentQuestionIndex }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }, [responses, currentSectionIndex, currentQuestionIndex, initialized])

    const currentSection = questionnaire.sections[currentSectionIndex]
    const currentQuestion = currentSection.questions[currentQuestionIndex]
    const totalQuestions = questionnaire.sections.reduce((total, section) => total + section.questions.length, 0)

    const answeredCount = useMemo(
        () => Object.values(responses).filter((value) => value !== null).length,
        [responses]
    )

    const isLastSection = currentSectionIndex === questionnaire.sections.length - 1
    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1
    const isFirstSection = currentSectionIndex === 0
    const isFirstQuestion = currentQuestionIndex === 0
    const isAtEnd = isLastSection && isLastQuestion
    const allComplete = answeredCount === totalQuestions

    const questionNumber =
        questionnaire.sections
            .slice(0, currentSectionIndex)
            .reduce((sum, s) => sum + s.questions.length, 0) +
        currentQuestionIndex +
        1

    const sections = questionnaire.sections.map((s) => ({
        id: s.id,
        name: s.name,
        questionCount: s.questions.length,
    }))

    const handleSelect = (questionId: string, value: number) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }))
        setError('')
    }

    const handlePrevious = () => {
        setError('')
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        } else if (!isFirstSection) {
            const prevSection = questionnaire.sections[currentSectionIndex - 1]
            setCurrentSectionIndex(currentSectionIndex - 1)
            setCurrentQuestionIndex(prevSection.questions.length - 1)
        }
    }

    const handleNext = () => {
        if (responses[currentQuestion.id] === null) {
            setError('Please answer this question before continuing.')
            return
        }
        setError('')
        if (!isLastQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else if (!isLastSection) {
            setCurrentSectionIndex(currentSectionIndex + 1)
            setCurrentQuestionIndex(0)
        }
    }

    const handleSubmit = () => {
        if (!allComplete) {
            setError(assessmentIncomplete)
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
        localStorage.removeItem(STORAGE_KEY)
        router.push('/results')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink}>← Back to home</Link>
                <p className={styles.sectionLabel}>
                    Section {currentSectionIndex + 1} of {questionnaire.sections.length} — {currentSection.name}
                </p>
                <h1 className={styles.heading}>{currentSection.description}</h1>
                <p className={styles.questionCount}>Question {questionNumber} of {totalQuestions}</p>
                <QuestionnaireProgress
                    sections={sections}
                    currentSectionIndex={currentSectionIndex}
                    totalAnswered={answeredCount}
                    totalQuestions={totalQuestions}
                />
            </div>

            <div className={styles.question}>
                <QuestionCard
                    key={currentQuestion.id}
                    sectionId={currentSection.id}
                    question={currentQuestion}
                    value={responses[currentQuestion.id]}
                    onSelect={handleSelect}
                />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={isFirstSection && isFirstQuestion}
                >
                    {previous}
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    onClick={isAtEnd ? handleSubmit : handleNext}
                >
                    {isAtEnd ? submit : continueLabel}
                </Button>
            </div>
        </div>
    )
}
