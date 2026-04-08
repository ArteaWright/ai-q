import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import styles from './page.module.css'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
      <main className={styles.main}>
      <h1 className={styles.title}>AI-Q</h1>
      <p className={styles.description}>
        Evaluate your AI readiness with AI-Q, the AI readiness assessment tool.
      </p>
    </main>
  )
}