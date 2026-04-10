import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateRecommendations } from '@/lib/ai-client'
import { AssessmentScore, UserResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAuth()
        if ('error' in auth) return auth.error
        const { user, supabase } = auth

        const body = await req.json() as { scores: AssessmentScore; responses: UserResponse[] }
        const { scores } = body

        // Generate recommendations via Claude API
        const recommendations = await generateRecommendations(scores)

        // Upsert so retakes overwrite the single row per user
        const { error: dbError } = await supabase.from('assessments').upsert(
            {
                user_id: user.id,
                overall_score: scores.overallPercentage,
                overall_readiness_level: scores.overallReadinessLevel,
                section_scores: scores.sectionScores,
                recommendations,
                completed_at: scores.completedAt,
            },
            { onConflict: 'user_id' }
        )

        if (dbError) {
            console.error('[assessment/submit] DB insert failed:', dbError)
            // Still return recommendations even if save fails
        }

        return NextResponse.json({ recommendations })
    } catch (error) {
        console.error('[assessment/submit]', error)
        return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 })
    }
}
