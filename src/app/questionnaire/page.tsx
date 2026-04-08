import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export default async function QuestionnairePage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div>
            <h1>AI Readiness Assessment Questionnaire</h1>
            <p>Welcome, {user.email}! The questionnaire will be implemented in Phase 2.2.</p>
            {/* TODO: Implement questionnaire UI */}
        </div>
    );
}