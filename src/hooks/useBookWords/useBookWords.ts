import { useEffect, useState } from 'react'
import type { WordWithChapter } from '../../services/vocab'
import { fetchWordsByBook } from '../../services/vocab'

export function useBookWords(bookId: string | null) {
  const [words, setWords] = useState<WordWithChapter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookId) {
      setWords([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    fetchWordsByBook(bookId)
      .then((data) => {
        if (active) setWords(data)
      })
      .catch((e) => {
        if (active) setError(String(e?.message ?? e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [bookId])

  return { words, loading, error }
}
