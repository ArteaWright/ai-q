import Link from 'next/link';
import styles from './nav.module.css';

export default function Nav() {
  return (
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
          {/* Outer arc */}
          <path
            d="M2 18 A20 20 0 0 1 34 18"
            stroke="rgba(255, 251, 242, 0.2)"
            strokeWidth="1.5"
          />
          {/* Mid arc */}
          <path
            d="M7 18 A14 14 0 0 1 29 18"
            stroke="rgba(255, 251, 242, 0.5)"
            strokeWidth="1.5"
          />
          {/* Inner arc */}
          <path
            d="M12 18 A8 8 0 0 1 24 18"
            stroke="#c36a3a"
            strokeWidth="2"
          />
          {/* Core dot */}
          <circle cx="18" cy="18" r="3" fill="#c36a3a" />
        </svg>
        <span className={styles.wordmark}>AIQ</span>
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
            <a href="#how-it-works">How it works</a>
          </li>
          <li className={styles.divider}>·</li>
          <li>
            <a href="#nonprofits">Who's it for?</a>
          </li>
          <li className={styles.divider}>·</li>
          <li>
            <a href="#about">About</a>
          </li>
        </ul>
        <button className={styles.ctaButton}>Start assessment</button>
      </div>
    </nav>
  );
}

