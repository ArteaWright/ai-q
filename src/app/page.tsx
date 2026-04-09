import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import HomeClient from '@/components/HomeClient'
import styles from './page.module.css'

export default async function Page() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: assessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <HomeClient assessment={assessment ?? null}>
            <main className={styles.main}>
                <h1 className={styles.title}>AI-Q</h1>
                <p className={styles.description}>
                    Evaluate your AI readiness with AI-Q, the AI readiness assessment tool.
                </p>

                <div className={styles.cards}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Data Readiness</h2>
                        <p className={styles.cardText}>
                            Discover how well your business manages data, quality, governance, and reporting.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Infrastructure & Integration</h2>
                        <p className={styles.cardText}>
                            See whether systems, tools, and workflows are prepared for AI adoption.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>People, Leadership & Security</h2>
                        <p className={styles.cardText}>
                            Review your team readiness, leadership alignment, and security posture.
                        </p>
                    </div>
                </div>

                <a className={styles.startButton} href="/questionnaire">
                    {assessment ? 'Start new assessment' : 'Start assessment'}
                </a>
            </main>
        </HomeClient>
    )
}
