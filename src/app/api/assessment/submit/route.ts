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

        // Generate recommendations (placeholder — replace with Claude API in ai-client.ts)
        const recommendations = await generateRecommendations(scores)

        // TODO (Phase 5): Persist to Supabase
        // await supabase.from('assessments').insert({
        //     user_id: user.id,
        //     overall_score: scores.overallPercentage,
        //     section_scores: scores.sectionScores,
        //     recommendations,
        //     completed_at: scores.completedAt,
        // })

        return NextResponse.json({ recommendations })
    } catch (error) {
        console.error('[assessment/submit]', error)
        return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 })
    }
}
