/**
 * Centralized storage key constants.
 * Using constants instead of inline strings prevents typos and makes
 * key renames a single-line change.
 */
export const STORAGE_KEYS = {
    /** Questionnaire in-progress state persisted to localStorage between sessions. */
    QUESTIONNAIRE_PROGRESS: 'questionnaire-progress',
    /** Assessment scores/responses staged in sessionStorage for the results page to consume. */
    PENDING_ASSESSMENT: 'pendingAssessment',
} as const
