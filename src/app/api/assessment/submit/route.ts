import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { generateRecommendations } from '@/lib/ai-client'
import { AssessmentScore, UserResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json() as { scores: AssessmentScore; responses: UserResponse[] }
        const { scores } = body

        // Generate recommendations via Claude API
        const recommendations = await generateRecommendations(scores)

        // Persist to Supabase — upsert so retakes overwrite the single row per user
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
