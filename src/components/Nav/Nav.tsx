'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './nav.module.css';

type ModalKey = 'how-it-works' | 'nonprofits' | 'about' | null

const modalContent: Record<NonNullable<ModalKey>, { title: string; body: React.ReactNode }> = {
  'how-it-works': {
    title: 'How it works',
    body: (
      <ol className={styles.modalList}>
        <li>
          <strong>Answer 15 questions</strong> across five readiness domains: Data, Infrastructure, Human Capital, Leadership, and Security.
        </li>
        <li>
          <strong>Get scored instantly.</strong> Each section is weighted and categorised as Low, Medium, or High readiness.
        </li>
        <li>
          <strong>Receive AI recommendations.</strong> Claude analyses your scores and returns a tailored report with key findings, immediate actions, and a 6-month roadmap.
        </li>
        <li>
          <strong>Download your report</strong> as a PDF to share with your team or leadership.
        </li>
      </ol>
    ),
  },
  'nonprofits': {
    title: "Who's it for?",
    body: (
      <div className={styles.modalProse}>
        <p>AI-Q is built for organisations that are serious about understanding where they stand before adopting AI — not after.</p>
        <ul className={styles.modalList}>
          <li><strong>Nonprofits and social enterprises</strong> navigating limited resources and high accountability.</li>
          <li><strong>Small and mid-sized businesses</strong> evaluating whether AI investment makes sense right now.</li>
          <li><strong>Leadership and strategy teams</strong> that need an evidence-based starting point for AI planning.</li>
          <li><strong>IT and operations leads</strong> benchmarking infrastructure and security posture against AI requirements.</li>
        </ul>
        <p>If you are deciding whether — and how — to adopt AI, this assessment gives you a structured answer.</p>
      </div>
    ),
  },
  'about': {
    title: 'About',
    body: (
      <div className={styles.modalProse}>
        <p><strong>AI-Q</strong> is a product of <strong>TechTrap Global</strong>, an intelligence and advisory firm focused on practical AI adoption for mission-driven organisations.</p>
        <p>We built AI-Q because most AI readiness frameworks are either too abstract or too technical. This assessment bridges the gap — translating your real operational context into clear, prioritised guidance.</p>
        <p>The assessment is powered by Claude (Anthropic) and covers the five domains that consistently determine whether an AI initiative succeeds or stalls.</p>
        <p className={styles.modalContact}>
          Questions or partnerships: <a href="mailto:connect@techtrapglobal.com">connect@techtrapglobal.com</a>
        </p>
      </div>
    ),
  },
}

interface NavProps {
  hasAssessment?: boolean
  onCtaClick?: () => void
}

export default function Nav({ hasAssessment = false, onCtaClick }: NavProps = {}) {
  const [openModal, setOpenModal] = useState<ModalKey>(null)

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [openModal])

  const close = () => setOpenModal(null)

  return (
    <>
      <nav className={styles.nav}>
        {/* Left: Logo and Wordmark */}
        <Link href="/" className={styles.logo}>
          <svg
            viewBox="0 0 36 22"
            width="36"
            height="22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.logoSvg}
          >
            <path d="M2 18 A20 20 0 0 1 34 18" stroke="rgba(255, 251, 242, 0.2)" strokeWidth="1.5" />
            <path d="M7 18 A14 14 0 0 1 29 18" stroke="rgba(255, 251, 242, 0.5)" strokeWidth="1.5" />
            <path d="M12 18 A8 8 0 0 1 24 18" stroke="#c36a3a" strokeWidth="2" />
            <circle cx="18" cy="18" r="3" fill="#c36a3a" />
          </svg>
          <span className={styles.wordmark}>AI-<span className={styles.q}>Q</span></span>
        </Link>

        {/* Center: Eyebrow */}
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          <span className={styles.eyebrowText}>TechTrap Global · AI Intelligence</span>
        </div>

        {/* Right: Navigation Links and CTA */}
        <div className={styles.right}>
          <ul className={styles.links}>
            <li>
              <button className={styles.navLink} onClick={() => setOpenModal('how-it-works')}>How it works</button>
            </li>
            <li className={styles.divider}>·</li>
            <li>
              <button className={styles.navLink} onClick={() => setOpenModal('nonprofits')}>Who&apos;s it for?</button>
            </li>
            <li className={styles.divider}>·</li>
            <li>
              <button className={styles.navLink} onClick={() => setOpenModal('about')}>About</button>
            </li>
          </ul>
        </div>
      </nav>

      {openModal && (
        <div className={styles.overlay} onClick={close} aria-modal="true" role="dialog">
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modalContent[openModal].title}</h2>
              <button className={styles.closeButton} onClick={close} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {modalContent[openModal].body}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
