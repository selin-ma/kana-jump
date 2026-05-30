import { useMemo, useState } from 'react'
import type { Word } from '../../types/vocab'
import { getFurigana } from '../../utils/furigana/furigana'
import AudioButton from './AudioButton/AudioButton'
import VocabDetailModal from './VocabDetailModal'

interface Props {
  words: Word[]
}

export default function VocabPreview({ words }: Props) {
  const [query, setQuery] = useState('')
  const [detailWord, setDetailWord] = useState<Word | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      (w) =>
        w.kana.toLowerCase().includes(q) ||
        (w.kanji && w.kanji.includes(q)) ||
        w.meaning_zh.includes(query),
    )
  }, [words, query])

  return (
    <div className='flex flex-col gap-3 w-full'>
      {/* Search */}
      <input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='搜索假名、汉字或释义…'
        className='w-full px-3 py-2 rounded-xl text-xs outline-none transition-colors bg-card text-leaf-text border border-leaf-border'
        style={{}}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#7A9E82')}
        onBlur={(e) => (e.currentTarget.style.borderColor = '#D8E4D8')}
      />

      {filtered.length === 0 && (
        <p className='text-xs text-center text-leaf-faint'>
          没有匹配的单词
        </p>
      )}

      {/* Word rows */}
      <div className='flex flex-col gap-1.5 max-h-[420px] overflow-y-auto'>
        {filtered.map((w) => (
          <div
            key={w.id}
            onClick={() => setDetailWord(w)}
            className='flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-left transition-colors bg-card border border-leaf-border2'
            onMouseEnter={(e) => (e.currentTarget.style.background = '#EEF4EF')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FEFCF8')}
          >
            {/* Index */}
            <span
              className='text-xs w-5 text-center shrink-0 text-leaf-faint'
            >
              {w.order_idx}
            </span>

            {/* Kana */}
            <span
              className='text-xs shrink-0 min-w-[60px] text-leaf-gray'
            >
              {w.kana}
            </span>

            {/* Kanji with furigana */}
            {w.kanji ? (
              <span className='text-sm font-light shrink-0 min-w-[60px]'>
                {getFurigana(w.kana, w.kanji).map((seg, i) =>
                  seg.reading ? (
                    <ruby key={i}>
                      {seg.text}
                      <rt
                        className='text-[9px] font-normal text-leaf-muted'
                      >
                        {seg.reading}
                      </rt>
                    </ruby>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </span>
            ) : (
              <span
                className='text-sm font-light shrink-0 min-w-[60px] text-leaf-text'
              >
                {w.kana}
              </span>
            )}

            {/* Meaning */}
            <span
              className='text-xs flex-1 truncate text-leaf-text'
            >
              {w.meaning_zh}
            </span>

            {/* Pitch accent */}
            {w.pitch_accent !== null && (
              <span
                className='text-xs shrink-0 text-leaf-note'
              >
                ①{w.pitch_accent}
              </span>
            )}

            {/* Audio */}
            <div className='shrink-0'>
              <AudioButton
                text={w.kana.replace(/[～〜]/g, '')}
                audioUrl={w.audio_url}
                size='sm'
              />
            </div>
          </div>
        ))}
      </div>

      <p className='text-xs text-right text-leaf-faint'>
        共 {filtered.length} 词
      </p>

      {detailWord && (
        <VocabDetailModal word={detailWord} onClose={() => setDetailWord(null)} />
      )}
    </div>
  )
}
