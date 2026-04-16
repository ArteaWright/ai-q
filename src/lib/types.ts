/** Named alias for the three readiness tiers used throughout scoring and display. */
export type ReadinessLevel = 'Low' | 'Medium' | 'High'

/** The four environment tracks resolved by the classifier. */
export type TrackKey = 'workflow' | 'scientific' | 'operational' | 'embedded'

/** Track-specific text and options for a section question. */
export interface TrackVariant {
    text: string
    options: string[]
}

export interface Question {
    id: string;
    /** Fallback label shown before the classifier resolves a track. */
    text: string;
    inputFormat: 'multipleChoice' | 'text';
    /** Top-level options for non-tracked questions (unused in tracked questions). */
    options?: string[];
    /** Track-specific variants; present on all section questions. */
    tracks?: Record<TrackKey, TrackVariant>;
    userInput: string;
}

/** A classifier question that routes the assessment to a track. Not scored. */
export interface ClassifierQuestion {
    id: string;
    text: string;
    inputFormat: 'multipleChoice';
    options: string[];
    userInput: string;
    /** Maps option index (as string) to the track it selects. */
    tracksTo: Record<string, TrackKey>;
}

export interface Classifier {
    id: string;
    name: string;
    description: string;
    questions: ClassifierQuestion[];
}

export interface Section {
    id: string;
    name: string;
    weight: number;
    description: string;
    questions: Question[];
}

export interface Questionnaire {
    classifier: Classifier;
    sections: Section[];
}

export interface UserResponse {
    sectionId: string;
    questionId: string;
    response: string | number;
}

/** Shared section score fields present in both computed scores and DB rows. */
export interface BaseSectionScore {
    sectionId: string;
    sectionName: string;
    percentage: number;
    readinessLevel: ReadinessLevel;
}

/** Full computed section score, including intermediate values from scoring.ts. */
export interface SectionScore extends BaseSectionScore {
    rawScore: number;
    maxScore: number;
    weightedContribution: number;
}

export interface AssessmentScore {
    overallPercentage: number;
    overallReadinessLevel: ReadinessLevel;
    /** Accepts both full SectionScore and the leaner DatabaseSectionScore from history. */
    sectionScores: BaseSectionScore[];
    completedAt: string;
}

export interface Assessment {
    id: string;
    userId: string;
    questionnaire: Questionnaire;
    responses: UserResponse[];
    scores: AssessmentScore;
    recommendations: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * DB shapes — match the Supabase `assessments` table column names (snake_case).
 * Use DatabaseAssessment when reading from Supabase; AssessmentScore for client logic.
 */
/** DB-persisted section score — same fields as BaseSectionScore (no computed intermediates). */
export interface DatabaseSectionScore extends BaseSectionScore {}

export interface DatabaseAssessment {
    overall_score: number;
    overall_readiness_level: ReadinessLevel;
    section_scores: DatabaseSectionScore[];
    recommendations: string;
    completed_at: string;
}

/**
 * Payload staged in sessionStorage under STORAGE_KEYS.PENDING_ASSESSMENT
 * for the results page to consume after an assessment is submitted or
 * when viewing history from the sidebar.
 */
export interface StoredAssessment {
    scores: AssessmentScore;
    responses: UserResponse[];
    fromHistory?: boolean;
    cachedRecommendations?: string;
}
