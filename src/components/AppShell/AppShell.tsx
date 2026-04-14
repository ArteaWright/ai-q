import styles from './app-shell.module.css'

interface Props {
    children: React.ReactNode
}

export default function AppShell({ children }: Props) {
    return (
        <div className={styles.layout}>
            {children}
        </div>
    )
}
