'use client'

import { useRef, useState, useCallback, useEffect, CSSProperties } from 'react'
import { ScrollCard } from '@/lib/data/scroll-cards'
import styles from './card.module.css'

interface BaseCardProps {
    background?: string
    border?: string
    width?: string
    height?: string
    padding?: string
    className?: string
    style?: CSSProperties
}

interface PlainCardProps extends BaseCardProps {
    scrollable?: false
    cards?: never
    children?: React.ReactNode
}

interface ScrollableCardProps extends BaseCardProps {
    scrollable: true
    cards: ScrollCard[]
    children?: never
}

type CardProps = PlainCardProps | ScrollableCardProps

export default function Card({
    background,
    border,
    width,
    height,
    padding,
    className = '',
    style,
    scrollable,
    cards,
    children,
}: CardProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLElement | null)[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const handleScrollButton = useCallback(() => {
        if (!cards) return
        const nextIndex = (currentIndex + 1) % cards.length
        setCurrentIndex(nextIndex)
        cardRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [currentIndex, cards])

    useEffect(() => {
        if (!scrollable) return
        const container = containerRef.current
        if (!container) return
        const block = (e: Event) => e.preventDefault()
        container.addEventListener('wheel', block, { passive: false })
        container.addEventListener('touchmove', block, { passive: false })
        return () => {
            container.removeEventListener('wheel', block)
            container.removeEventListener('touchmove', block)
        }
    }, [scrollable])

    const rootStyle: CSSProperties = {
        ...(background && { background }),
        ...(border && { border }),
        ...(width && { width }),
        ...(height && { height }),
        ...(padding && { padding }),
        ...style,
    }

    if (scrollable && cards) {
        const isLast = currentIndex === cards.length - 1
        return (
            <div className={`${styles.card} ${styles.scrollCard} ${className}`} style={rootStyle}>
                <div ref={containerRef} className={styles.scrollContainer}>
                    <div className={styles.cardsWrapper}>
                        {cards.map((card, i) => (
                            <article
                                key={card.id}
                                ref={el => { cardRefs.current[i] = el }}
                                className={styles.cardItem}
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
        )
    }

    return (
        <div className={`${styles.card} ${className}`} style={rootStyle}>
            {children}
        </div>
    )
}
