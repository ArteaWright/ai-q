'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import styles from './retake-modal.module.css'

interface Props {
    onClose: () => void
}

export default function RetakeModal({ onClose }: Props) {
    const router = useRouter()

    const handleRetake = () => {
        onClose()
        router.push('/questionnaire')
    }

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="retake-title">
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    ✕
                </button>
                <h2 className={styles.title} id="retake-title">Before you retake</h2>
                <p className={styles.body}>
                    Retaking the assessment will permanently overwrite your previous results and recommendations.
                    Once you start, your previous report will no longer be available.
                </p>
                <p className={styles.hint}>
                    If you'd like to keep a copy, download your PDF report before continuing.
                </p>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onClose}>
                        Go back
                    </Button>
                    <Button variant="primary" onClick={handleRetake}>
                        Retake anyway
                    </Button>
                </div>
            </div>
        </div>
    )
}
