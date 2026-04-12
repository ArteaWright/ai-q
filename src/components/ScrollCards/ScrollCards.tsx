'use client';

import { ScrollCard } from '@/lib/scroll-cards';
import styles from './scroll-cards.module.css';

interface ScrollCardsProps {
  cards: ScrollCard[];
}

export default function ScrollCards({ cards }: ScrollCardsProps) {
  return (
    <div className={styles.scrollContainer}>
      <div className={styles.cardsWrapper}>
        {cards.map((card) => (
          <article key={card.id} className={styles.card}>
            <h2 className={styles.headline}>{card.headline}</h2>
            <p className={styles.tagline}>{card.tagline}</p>
            <p className={styles.body}>{card.body}</p>
          </article>
        ))}
      </div>

      {/* Scroll hint */}
      {/* <div className={styles.scrollHint}>
        <span className={styles.scrollLabel}>Scroll</span>
        <div className={styles.scrollLine} />
      </div> */}
    </div>
  );
}
