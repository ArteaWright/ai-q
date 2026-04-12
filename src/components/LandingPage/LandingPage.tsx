'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import AuthModal from '@/components/AuthModal'

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false)

    return (
        <>
            <Nav />
            <Hero
                onStartClick={() => setShowAuth(true)}
                onSeeHowClick={() => {
                    // For now, just log. Can be updated to scroll to section or navigate
                    console.log('See how it works clicked')
                }}
            />
            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                defaultTab="signup"
            />
        </>
    )
}

