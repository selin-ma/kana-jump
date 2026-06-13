import { useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { WordWithChapter } from '../../services/vocab'
import AudioButton from './AudioButton/AudioButton'

interface Props {
  words: WordWithChapter[]
  loading: boolean
  error: string | null
}

export default function BookBrowser({ words, loading, error }: Props) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? words.filter(
        (w) =>
          w.kana.includes(query) ||
          (w.kanji ?? '').includes(query) ||
          w.meaning_zh.includes(query),
      )
    : words

  const virtualizer = useWindowVirtualizer({
    count: filtered.length,
    estimateSize: () => 52,
    overscan: 8,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  const countLabel = query.trim() ? `找到 ${filtered.length} 词` : `共 ${words.length} 词`

  return (
    <div className='flex flex-col gap-3 w-full'>
      {/* Search */}
      <input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='搜索假名、汉字或释义…'
        className='w-full px-3 py-2 rounded-xl text-sm outline-none'
        style={{
          background: '#FEFCF8',
          border: '1px solid #E4E8E0',
          color: '#3A4A3C',
        }}
      />

      <span className='text-xs' style={{ color: '#A8B4A8' }}>
        {countLabel}
      </span>

      {/* States */}
      {loading && (
        <p className='text-sm' style={{ color: '#B8C4B8' }}>
          加载中…
        </p>
      )}
      {error && (
        <p className='text-sm' style={{ color: '#C08878' }}>
          {error}
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className='text-sm' style={{ color: '#B8C4B8' }}>
          {query.trim() ? '没有匹配的单词' : '这本书还没有单词'}
        </p>
      )}

      {/* Virtual list — uses window scroll, no fixed height needed */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div
            ref={listRef}
            style={{ position: 'relative', height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((vItem) => {
              const w = filtered[vItem.index]
              const meaning =
                w.meaning_zh.length > 14 ? w.meaning_zh.slice(0, 14) + '…' : w.meaning_zh
              return (
                <div
                  key={vItem.key}
                  data-index={vItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vItem.start - virtualizer.options.scrollMargin}px)`,
                    paddingBottom: '4px',
                  }}
                >
                  <div
                    className='flex items-center gap-2 px-3 py-2 rounded-xl'
                    style={{
                      background: '#FEFCF8',
                      border: '1px solid #E4E8E0',
                    }}
                  >
                    <span
                      className='text-xs w-6 shrink-0 text-right'
                      style={{ color: '#A8B4A8' }}
                    >
                      {vItem.index + 1}
                    </span>

                    <span
                      className='text-sm font-medium shrink-0'
                      style={{ color: '#3A4A3C' }}
                    >
                      {w.kana}
                    </span>

                    {w.kanji && (
                      <span className='text-xs shrink-0' style={{ color: '#7A9E82' }}>
                        {w.kanji}
                      </span>
                    )}

                    <span
                      className='text-xs flex-1 truncate'
                      style={{ color: '#6A7A6A' }}
                    >
                      {meaning}
                    </span>

                    <span
                      className='text-xs px-2 py-0.5 rounded-full shrink-0'
                      style={{ background: '#F0F4F0', color: '#7A9E82' }}
                    >
                      {w.chapterTitle}
                    </span>

                    {w.audio_url && (
                      <div className='shrink-0'>
                        <AudioButton text={w.kana} audioUrl={w.audio_url} size='sm' />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ height: '64px' }} />
        </>
      )}
    </div>
  )
}
