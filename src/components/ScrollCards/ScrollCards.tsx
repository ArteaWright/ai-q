'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ScrollCard } from '@/lib/scroll-cards';
import styles from './scroll-cards.module.css';

interface ScrollCardsProps {
    cards: ScrollCard[];
}

export default function ScrollCards({ cards }: ScrollCardsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScrollButton = useCallback(() => {
        const nextIndex = (currentIndex + 1) % cards.length;
        setCurrentIndex(nextIndex);
        cardRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [currentIndex, cards.length]);

    // Sync currentIndex when user scrolls manually
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const index = Math.round(scrollTop / containerHeight);
            setCurrentIndex(Math.min(index, cards.length - 1));
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [cards.length]);

    const isLast = currentIndex === cards.length - 1;

    return (
        <div className={styles.wrapper}>
            <div ref={containerRef} className={styles.scrollContainer}>
                <div className={styles.cardsWrapper}>
                    {cards.map((card, i) => (
                        <article
                            key={card.id}
                            ref={el => { cardRefs.current[i] = el; }}
                            className={styles.card}
                        >
                            <h2 className={styles.headline}>{card.headline}</h2>
                            <p className={styles.tagline}>{card.tagline}</p>
                            <p className={styles.body}>{card.body}</p>
                        </article>
                    ))}
                </div>
            </div>

            <button
                className={styles.scrollButton}
                onClick={handleScrollButton}
                aria-label={isLast ? 'Back to first card' : 'Scroll to next card'}
            >
                <svg
                    className={`${styles.scrollArrow} ${isLast ? styles.scrollArrowUp : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M3 6l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
