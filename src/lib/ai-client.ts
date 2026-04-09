import Anthropic from '@anthropic-ai/sdk'
import { AssessmentScore } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateRecommendations(scores: AssessmentScore): Promise<string> {
    const sectionSummary = scores.sectionScores
        .map((s) => `- ${s.sectionName}: ${Math.round(s.percentage)}% (${s.readinessLevel})`)
        .join('\n')

    const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `Analyze this business AI readiness assessment and provide actionable recommendations.

Section scores:
${sectionSummary}

Overall readiness: ${Math.round(scores.overallPercentage)}% (${scores.overallReadinessLevel})

Provide a structured response with these four sections:
1. KEY FINDINGS — one bullet per Low or Medium section explaining the gap
2. IMMEDIATE ACTION ITEMS — top 3 specific actions the business should take now
3. 6-MONTH ROADMAP — month-by-month milestones to improve readiness
4. RESOURCE RECOMMENDATIONS — tools, frameworks, or services to support improvement

Be concise, practical, and specific to the scores above.`,
            },
        ],
    })

    return (message.content[0] as { type: 'text'; text: string }).text
}
