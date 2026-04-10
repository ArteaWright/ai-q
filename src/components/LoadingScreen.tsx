'use client'

import styles from './loading-screen.module.css'

interface Props {
    text?: string
}

export default function LoadingScreen({ text = 'Loading…' }: Props) {
    return (
        <div className={styles.screen}>
            <div className={styles.ring}>
                <div className={styles.innerRing} />
            </div>
            <p className={styles.text}>{text}</p>
        </div>
    )
}
