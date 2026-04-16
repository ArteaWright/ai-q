import Anthropic from '@anthropic-ai/sdk'
import { AssessmentScore } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ENVIRONMENT_CONTEXT: Record<string, string> = {
    embedded:    'AI in physical systems — robotics, hardware, manufacturing. Factor in safety certification, edge compute, and real-world failure consequences.',
    scientific:  'AI for research and discovery — biotech, pharma, modeling. Factor in model validation, research integrity, and IP protection.',
    operational: 'AI in real-time operations — logistics, infrastructure, process control. Factor in latency, fallback systems, and operational risk.',
    workflow:    'AI in knowledge work and digital tools. Factor in data readiness, tool selection discipline, and change management.',
}

export async function generateRecommendations(
    scores: AssessmentScore,
    environmentTrack: string = 'workflow'
): Promise<string> {
    const sectionSummary = scores.sectionScores
        .map((s) => `- ${s.sectionName}: ${Math.round(s.percentage)}% (${s.readinessLevel})`)
        .join('\n')

    const environmentContext = ENVIRONMENT_CONTEXT[environmentTrack] ?? ENVIRONMENT_CONTEXT.workflow

    const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `You are an AI strategy advisor. 
Be direct and honest, but with a friendly tone, plain-spoken, and specific to the scores below. 
No jargon, no filler, with strategic and non-generic advice.

ENVIRONMENT: ${environmentTrack.toUpperCase()}
${environmentContext}

SCORES:
${sectionSummary}
Overall: ${Math.round(scores.overallPercentage)}% — ${scores.overallReadinessLevel}

SCORING RULES:
- Data Readiness (40% weight) below 40% is a hard blocker.
- Any section below 40% will prevent successful adoption.
- 40–69% = readiness with meaningful work remaining.
- 70%+ = ready to support implementation.

RESPOND WITH EXACTLY THESE FIVE SECTIONS:

1. SITUATION SUMMARY
2–3 sentences. What does this score pattern actually mean 
for this organization right now?

2. CRITICAL GAPS
One bullet per section below 70% only. State the specific 
consequence of that gap in this environment — what goes 
wrong if they move forward without fixing it.

3. FIRST 90 DAYS
3 sequenced actions. Each must include: what, who owns it, 
and what done looks like. Order matters.

4. 6-MONTH ROADMAP
Month-by-month outcomes, not activities. Measurable. 
Anchor to lowest-scoring sections first.

5. BIGGEST MISTAKE
One short paragraph. What do organizations at this score 
level in this environment most commonly get wrong when they 
try to move forward? Be blunt.`,
            },
        ],
    })

    return (message.content[0] as { type: 'text'; text: string }).text
}