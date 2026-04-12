import { getServerUser } from '@/lib/auth-helpers'
import Link from 'next/link'
import LandingPage from '@/components/LandingPage'
import Nav from '@/components/Nav'
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
        <>
            <Nav />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Left Column - Dashboard Content */}
                    <div className={styles.leftColumn}>
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
                    </div>

                    {/* Right Column - Placeholder Card */}
                    <div className={styles.rightColumn}>
                        <div className={styles.placeholderCard}>
                            <h2 className={styles.placeholderTitle}>Coming Soon</h2>
                            <p className={styles.placeholderText}>
                                Interactive story content will appear here to guide you through your AI readiness journey.
                            </p>
                            <div className={styles.placeholderGraphic}>
                                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="200" height="200" fill="rgba(255, 251, 242, 0.05)" />
                                    <circle cx="100" cy="100" r="50" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.3" />
                                    <circle cx="100" cy="100" r="35" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.5" />
                                    <circle cx="100" cy="100" r="20" fill="var(--color-accent)" opacity="0.7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className={styles.scrollHint}>
                    <span className={styles.scrollLabel}>Scroll</span>
                    <div className={styles.scrollLine} />
                </div>
            </main>
        </>
    )
}
