'use client'

import { useState } from 'react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/Button'
import styles from './landing-page.module.css'

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false)

    return (
        <main className={styles.main}>
            {/* Phase 7.2: Replace this section with <HeroSection /> — 3D render + headline */}
            <div className={styles.hero}>
                <h1 className={styles.title}>AI-Q</h1>
                <p className={styles.description}>
                    Evaluate your business AI readiness across data, infrastructure, people, leadership, and security.
                </p>
                <Button variant="primary" size="large" onClick={() => setShowAuth(true)}>
                    Get started
                </Button>
            </div>

            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                defaultTab="signup"
            />
        </main>
    )
}
