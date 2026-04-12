import { getServerUser } from '@/lib/auth-helpers'
import Link from 'next/link'
import LandingPage from '@/components/LandingPage'
import RetakeButton from '@/components/RetakeButton'
import styles from './page.module.css'

const sections = [
    {
        title: 'Data Readiness',
        text: 'Discover how well your business manages data, quality, governance, and reporting.',
    },
    {
        title: 'Infrastructure & Integration',
        text: 'See whether systems, tools, and workflows are prepared for AI adoption.',
    },
    {
        title: 'People, Leadership & Security',
        text: 'Review your team readiness, leadership alignment, and security posture.',
    },
]

export default async function HomePage() {
    const { user, supabase } = await getServerUser()

    if (!user) return <LandingPage />

    const { data: assessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id)
        .single()

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>AI-Q</h1>
            <p className={styles.description}>
                Evaluate your AI readiness with AI-Q, the AI readiness assessment tool.
            </p>

            <div className={styles.cards}>
                {sections.map((section) => (
                    <div key={section.title} className={styles.card}>
                        <h2 className={styles.cardTitle}>{section.title}</h2>
                        <p className={styles.cardText}>{section.text}</p>
                    </div>
                ))}
            </div>

            {assessment ? (
                <RetakeButton className={styles.startButton} label="Retake assessment" />
            ) : (
                <Link href="/questionnaire" className={styles.startButton}>
                    Start assessment
                </Link>
            )}

            {/* Scroll hint */}
            <div className={styles.scrollHint}>
                <span className={styles.scrollLabel}>Scroll</span>
                <div className={styles.scrollLine} />
            </div>
        </main>
    )
}
