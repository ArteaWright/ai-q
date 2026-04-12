'use client'

import styles from './progress-bar.module.css'

interface ProgressBarProps {
    current: number
    max: number
    label?: string
}

export default function ProgressBar({ current, max, label }: ProgressBarProps) {
    const percent = max > 0 ? Math.round((current / max) * 100) : 0

    return (
        <div className={styles.wrapper}>
            <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${percent}%` }} />
            </div>
            <p className={styles.label}>{label ?? `${percent}% complete`}</p>
        </div>
    )
}
