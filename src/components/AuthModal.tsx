'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import styles from './auth-modal.module.css'

type Tab = 'login' | 'signup'

interface Props {
    isOpen: boolean
    onClose: () => void
    defaultTab?: Tab
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: Props) {
    const [tab, setTab] = useState<Tab>(defaultTab)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const resetForm = () => {
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setError('')
    }

    const switchTab = (next: Tab) => {
        resetForm()
        setTab(next)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            onClose()
            router.refresh()
        }
        setLoading(false)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
            setError(error.message)
        } else {
            onClose()
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabel={tab === 'login' ? 'Log in' : 'Sign up'}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === 'login' ? styles.active : ''}`}
                    onClick={() => switchTab('login')}
                >
                    Log in
                </button>
                <button
                    className={`${styles.tab} ${tab === 'signup' ? styles.active : ''}`}
                    onClick={() => switchTab('signup')}
                >
                    Sign up
                </button>
            </div>

            {tab === 'login' ? (
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className={styles.input}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </Button>
                    <p className={styles.footer}>
                        Forgot your password?{' '}
                        <Link href="/auth/login" onClick={onClose}>Use the full login page</Link>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="auth-signup-email">Email</label>
                        <input
                            id="auth-signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="auth-signup-password">Password</label>
                        <input
                            id="auth-signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="auth-confirm-password">Confirm password</label>
                        <input
                            id="auth-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            className={styles.input}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign up'}
                    </Button>
                </form>
            )}
        </Modal>
    )
}
