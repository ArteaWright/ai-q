'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import styles from './retake-button.module.css'

interface Props {
    /** Applied to the trigger button so it inherits the caller's visual style. */
    className?: string
    label?: string
}

export default function RetakeButton({ className, label = 'Retake assessment' }: Props) {
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    const handleConfirm = () => {
        setShowModal(false)
        router.push('/questionnaire')
    }

    return (
        <>
            <button className={className} onClick={() => setShowModal(true)}>
                {label}
            </button>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} ariaLabel="Retake assessment">
                <h2 className={styles.title}>Before you retake</h2>
                <p className={styles.body}>
                    Retaking the assessment will permanently overwrite your previous results and recommendations.
                    Once you start, your previous report will no longer be available.
                </p>
                <p className={styles.hint}>
                    If you&apos;d like to keep a copy, download your PDF report before continuing.
                </p>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Go back
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Retake anyway
                    </Button>
                </div>
            </Modal>
        </>
    )
}
