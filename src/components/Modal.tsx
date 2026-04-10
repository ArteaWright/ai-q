'use client'

import { useEffect } from 'react'
import styles from './modal.module.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    ariaLabel: string
    children: React.ReactNode
}

export default function Modal({ isOpen, onClose, ariaLabel, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            onClick={onClose}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    ✕
                </button>
                {children}
            </div>
        </div>
    )
}
