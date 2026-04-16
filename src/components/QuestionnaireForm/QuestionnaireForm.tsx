'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import questionnaireData from '@/lib/data/questionnaire.json'
import { calculateOverallScore } from '@/utils/scoring'
import { Questionnaire, UserResponse, TrackKey, ClassifierQuestion } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import Button from '@/components/Button'
import QuestionCard from '@/components/QuestionCard'
import QuestionnaireProgress from '@/components/QuestionnaireProgress'
import styles from './questionnaire-form.module.css'

const questionnaire = questionnaireData as Questionnaire

/** Vote across both classifier questions and return the winning track. */
function resolveTrack(
    questions: ClassifierQuestion[],
    responses: Record<string, number | null>
): TrackKey {
    const votes: Record<TrackKey, number> = { workflow: 0, scientific: 0, operational: 0, embedded: 0 }
    for (const q of questions) {
        const answer = responses[q.id]
        if (answer !== null && answer !== undefined) {
            const track = q.tracksTo[String(answer)]
            if (track) votes[track]++
        }
    }
    const maxVotes = Math.max(...Object.values(votes))
    const topTracks = (Object.keys(votes) as TrackKey[]).filter((t) => votes[t] === maxVotes)
    if (topTracks.length === 1) return topTracks[0]
    // Tiebreak: defer to first classifier question's answer
    const firstAnswer = responses[questions[0].id]
    if (firstAnswer !== null && firstAnswer !== undefined) {
        const track = questions[0].tracksTo[String(firstAnswer)]
        if (track) return track
    }
    return 'workflow'
}

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
    phase: 'classifier' | 'sections'
    currentClassifierIndex: number
    classifierResponses: Record<string, number | null>
    resolvedTrack: TrackKey | null
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

    // ── Classifier state ──────────────────────────────────────────────
    const [phase, setPhase] = useState<'classifier' | 'sections'>('classifier')
    const [currentClassifierIndex, setCurrentClassifierIndex] = useState(0)
    const [classifierResponses, setClassifierResponses] = useState<Record<string, number | null>>(() => {
        const initial: Record<string, number | null> = {}
        questionnaire.classifier.questions.forEach((q) => { initial[q.id] = null })
        return initial
    })
    const [resolvedTrack, setResolvedTrack] = useState<TrackKey | null>(null)

    // ── Section state ─────────────────────────────────────────────────
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, number | null>>(() => {
        const initial: Record<string, number | null> = {}
        questionnaire.sections.forEach((section) => {
            section.questions.forEach((question) => { initial[question.id] = null })
        })
        return initial
    })
    const [error, setError] = useState('')
    const [initialized, setInitialized] = useState(false)

    // ── Restore saved progress ────────────────────────────────────────
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS)
            if (saved) {
                const progress: SavedProgress = JSON.parse(saved)
                const hasAnswers =
                    Object.values(progress.responses).some((v) => v !== null) ||
                    Object.values(progress.classifierResponses).some((v) => v !== null)
                if (hasAnswers) {
                    setPhase(progress.phase)
                    setCurrentClassifierIndex(progress.currentClassifierIndex)
                    setClassifierResponses((prev) => ({ ...prev, ...progress.classifierResponses }))
                    setResolvedTrack(progress.resolvedTrack)
                    setResponses((prev) => ({ ...prev, ...progress.responses }))
                    setCurrentSectionIndex(progress.currentSectionIndex)
                    setCurrentQuestionIndex(progress.currentQuestionIndex)
                }
            }
        } catch {
            // ignore corrupted data
        }
        setInitialized(true)
    }, [])

    // ── Save progress ─────────────────────────────────────────────────
    useEffect(() => {
        if (!initialized) return
        const progress: SavedProgress = {
            phase,
            currentClassifierIndex,
            classifierResponses,
            resolvedTrack,
            responses,
            currentSectionIndex,
            currentQuestionIndex,
        }
        localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS, JSON.stringify(progress))
    }, [phase, currentClassifierIndex, classifierResponses, resolvedTrack, responses, currentSectionIndex, currentQuestionIndex, initialized])

    // ── Derived: classifier ───────────────────────────────────────────
    const classifierQuestions = questionnaire.classifier.questions
    const currentClassifierQuestion = classifierQuestions[currentClassifierIndex]
    const isLastClassifierQuestion = currentClassifierIndex === classifierQuestions.length - 1

    // ── Derived: sections ─────────────────────────────────────────────
    const currentSection = questionnaire.sections[currentSectionIndex]
    const currentQuestion = currentSection.questions[currentQuestionIndex]
    const totalQuestions = questionnaire.sections.reduce((total, s) => total + s.questions.length, 0)

    const answeredCount = useMemo(
        () => Object.values(responses).filter((v) => v !== null).length,
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

    // Resolve track-specific text/options for the current section question
    const resolvedQuestion = useMemo(() => {
        if (!resolvedTrack || !currentQuestion.tracks) return currentQuestion
        const variant = currentQuestion.tracks[resolvedTrack]
        return { ...currentQuestion, text: variant.text, options: variant.options }
    }, [currentQuestion, resolvedTrack])

    // ── Handlers: classifier ──────────────────────────────────────────
    const handleClassifierSelect = (questionId: string, value: number) => {
        setClassifierResponses((prev) => ({ ...prev, [questionId]: value }))
        setError('')
    }

    const handleClassifierPrevious = () => {
        setError('')
        if (currentClassifierIndex > 0) setCurrentClassifierIndex(currentClassifierIndex - 1)
    }

    const handleClassifierNext = () => {
        if (classifierResponses[currentClassifierQuestion.id] === null) {
            setError('Please answer this question before continuing.')
            return
        }
        setError('')
        if (!isLastClassifierQuestion) {
            setCurrentClassifierIndex(currentClassifierIndex + 1)
        } else {
            const track = resolveTrack(classifierQuestions, classifierResponses)
            setResolvedTrack(track)
            setPhase('sections')
        }
    }

    // ── Handlers: sections ────────────────────────────────────────────
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
        sessionStorage.setItem(STORAGE_KEYS.PENDING_ASSESSMENT, JSON.stringify({ scores, responses: userResponses }))
        localStorage.removeItem(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS)
        router.push('/results')
    }

    // ── Classifier phase UI ───────────────────────────────────────────
    if (phase === 'classifier') {
        // Build a Question-compatible object for QuestionCard
        const displayQuestion = {
            id: currentClassifierQuestion.id,
            text: currentClassifierQuestion.text,
            inputFormat: currentClassifierQuestion.inputFormat as 'multipleChoice',
            options: currentClassifierQuestion.options,
            userInput: '',
        }

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>← Back to home</Link>
                    <p className={styles.sectionLabel}>
                        Setup — {currentClassifierIndex + 1} of {classifierQuestions.length}
                    </p>
                    <h1 className={styles.heading}>Help us tailor your assessment</h1>
                    <p className={styles.questionCount}>
                        These questions are not scored. They route you to the right track.
                    </p>
                </div>

                <div className={styles.question}>
                    <QuestionCard
                        key={currentClassifierQuestion.id}
                        sectionId="classifier"
                        question={displayQuestion}
                        value={classifierResponses[currentClassifierQuestion.id]}
                        onSelect={handleClassifierSelect}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClassifierPrevious}
                        disabled={currentClassifierIndex === 0}
                    >
                        {previous}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleClassifierNext}
                    >
                        {isLastClassifierQuestion ? 'Start assessment' : continueLabel}
                    </Button>
                </div>
            </div>
        )
    }

    // ── Sections phase UI ─────────────────────────────────────────────
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
                    question={resolvedQuestion}
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
