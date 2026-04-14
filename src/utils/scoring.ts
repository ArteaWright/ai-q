import { Question, Section, UserResponse, AssessmentScore, SectionScore } from '../lib/types';

// Maps Likert scale (0–4) to point values (0–10).
// Max 10 points per question × 3 questions = 30 points per section.
// This scale lets weighted contributions sum cleanly to 100% overall.
const scoreMap: Record<number, number> = {
    4: 10,
    3: 7.5,
    2: 5,
    1: 2.5,
    0: 0,
};

export function scoreToPercentage(score: number): number {
    return scoreMap[score] ?? 0;
}

export function parseResponseToScore(
    response: string | number,
    inputFormat: 'multipleChoice' | 'text'
): number {
    if (inputFormat === 'multipleChoice') {
        const parsed = typeof response === 'number' ? response : parseInt(response, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 4) {
            return parsed;
        }
    }

    return 0;
}

export function categorizeReadiness(
    percentage: number
): 'Low' | 'Medium' | 'High' {
    if (percentage < 40) return 'Low';
    if (percentage <= 70) return 'Medium';
    return 'High';
}

export function calculateSectionScore(
    section: Section,
    responses: UserResponse[]
): SectionScore {
    const sectionResponses = responses.filter((response) => response.sectionId === section.id);

    let rawScore = 0;
    let questionCount = 0;

    for (const question of section.questions) {
        const response = sectionResponses.find((item) => item.questionId === question.id);
        const score = response
            ? parseResponseToScore(response.response, question.inputFormat)
            : 0;

        rawScore += scoreToPercentage(score);
        questionCount += 1;
    }

    const maxScore = questionCount * 10;
    const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;
    const readinessLevel = categorizeReadiness(percentage);
    // Normalize the section percentage (0–100) to a 0–1 fraction, apply the
    // section's weight (also 0–1), then scale back to a 0–100 contribution.
    // All section contributions sum to the overall readiness percentage.
    const weightedContribution = (percentage / 100) * section.weight * 100;

    return {
        sectionId: section.id,
        sectionName: section.name,
        rawScore,
        maxScore,
        percentage,
        readinessLevel,
        weightedContribution,
    };
}

export function calculateOverallScore(
    sections: Section[],
    responses: UserResponse[]
): AssessmentScore {
    const sectionScores = sections.map((section) => calculateSectionScore(section, responses));

    const overallPercentage = sectionScores.reduce(
        (total, sectionScore) => total + sectionScore.weightedContribution,
        0
    );

    return {
        overallPercentage,
        overallReadinessLevel: categorizeReadiness(overallPercentage),
        sectionScores,
        completedAt: new Date().toISOString(),
    };
}
