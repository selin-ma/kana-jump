import { supabase } from '../lib/supabase'
import type { Book, Chapter, Word } from '../types/vocab'

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase.from('books').select('*').order('code')
  if (error) throw error
  return (data ?? []) as Book[]
}

export async function fetchChapters(bookId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('order_idx')
  if (error) throw error
  return (data ?? []) as Chapter[]
}

export async function fetchWordsByChapter(chapterId: string): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('order_idx')
  if (error) throw error
  return (data ?? []) as Word[]
}

export interface WordWithChapter extends Word {
  chapterTitle: string
  chapterOrderIdx: number
}

export async function fetchWordsByBook(bookId: string): Promise<WordWithChapter[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*, chapters!inner(title, order_idx, book_id)')
    .eq('chapters.book_id', bookId)
    .order('order_idx', { referencedTable: 'chapters' })
    .order('order_idx')
  if (error) throw error
  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    chapterTitle: row.chapters.title as string,
    chapterOrderIdx: row.chapters.order_idx as number,
    chapters: undefined,
  })) as WordWithChapter[]
}
