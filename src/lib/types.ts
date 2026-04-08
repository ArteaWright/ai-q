export interface Question {
    id: string;
    text: string;
    inputFormat: 'multipleChoice' | 'text';
    options?: string[];
    userInput: string;
}

export interface Section {
    id: string;
    name: string;
    weight: number;
    description: string;
    questions: Question[];
}

export interface Questionnaire {
    sections: Section[];
}

export interface UserResponse {
    sectionId: string;
    questionId: string;
    response: string | number;
}

export interface SectionScore {
    sectionId: string;
    sectionName: string;
    rawScore: number;
    maxScore: number;
    percentage: number;
    readinessLevel: 'Low' | 'Medium' | 'High';
    weightedContribution: number;
}

export interface AssessmentScore {
    overallPercentage: number;
    overallReadinessLevel: 'Low' | 'Medium' | 'High';
    sectionScores: SectionScore[];
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
