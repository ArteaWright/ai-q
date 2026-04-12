'use client';

import HeroCanvas from '@/components/HeroCanvas';
import styles from './hero.module.css';

interface HeroProps {
  onStartClick?: () => void;
  onSeeHowClick?: () => void;
}

export default function Hero({ onStartClick, onSeeHowClick }: HeroProps) {
  return (
    <section className={styles.hero}>
      {/* Background texture overlay */}
      <div className={styles.textureOverlay} />

      {/* Main hero flex container: content (50%) | canvas (50%) */}
      <div className={styles.heroMain}>
        {/* Left column: text content */}
        <div className={styles.content}>
          {/* Headline */}
          <h1 className={styles.headline}>
            Know Before You Leap.
            <br />
            <span className={styles.accentText}>Find your signal.</span>
          </h1>

          {/* Tagline */}
          <div className={styles.tagline}>
            <span className={styles.taglineRule} />
            <span className={styles.taglineText}>AI Readiness Assessment</span>
          </div>

          {/* Body copy */}
          <p className={styles.bodyCopy}>
            Most companies think they're ready for AI. Fewer than 1 in 4{' '}
            <span className={styles.warmText}>actually are.</span> AIQ reads the pattern of
            your business and tells you exactly which type of AI fits — and why — before you
            spend a dollar finding out the hard way.
          </p>

          {/* CTA Row */}
          <div className={styles.ctaRow}>
            <button className={styles.primaryButton} onClick={onStartClick}>
              Start your AIQ assessment →
            </button>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                <span>10</span>
                <span className={styles.statAccent}>q</span>
              </div>
              <div className={styles.statLabel}>Questions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                <span>6</span>
                <span className={styles.statAccent}>+</span>
              </div>
              <div className={styles.statLabel}>Domains scored</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>5 min</div>
              <div className={styles.statLabel}>No email needed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                AI<span className={styles.statAccent}>✦</span>
              </div>
              <div className={styles.statLabel}>Powered by Claude</div>
            </div>
          </div>
        </div>

        {/* Right column: canvas animation (50%) */}
        <div className={styles.canvasWrapper}>
          <HeroCanvas />
        </div>
      </div>
    </section>
  );
}
