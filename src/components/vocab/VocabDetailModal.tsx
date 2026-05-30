import type { Word } from '../../types/vocab'
import { getFurigana } from '../../utils/furigana/furigana'
import AudioButton from './AudioButton/AudioButton'

interface Props {
  word: Word
  onClose: () => void
}

export default function VocabDetailModal({ word, onClose }: Props) {
  const speakText = word.kana.replace(/[～〜]/g, '')

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-[60] px-4'
      style={{ background: 'rgba(58,74,60,0.22)' }}
      onClick={onClose}
    >
      <div
        className='rounded-2xl p-6 flex flex-col items-center gap-4 relative bg-card-back border border-leaf-border'
        style={{
          boxShadow: '0 8px 32px rgba(80,110,85,0.18)',
          width: 'min(320px, calc(100vw - 32px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: number + close */}
        <div className='flex items-center justify-between w-full'>
          <span className='text-xs text-leaf-note'>第 {word.order_idx} 词</span>
          <button
            onClick={onClose}
            className='text-xl leading-none transition-colors text-leaf-faint hover:text-leaf'
          >
            ×
          </button>
        </div>

        {/* Kana + audio row */}
        <div className='flex items-center gap-3'>
          <span className='text-2xl font-light tracking-wider text-leaf-text'>
            {word.kana}
          </span>
          <AudioButton text={speakText} audioUrl={word.audio_url} size='sm' />
        </div>

        {/* Kanji with furigana */}
        {word.kanji ? (
          <span className='text-xl font-light text-leaf-deep'>
            {getFurigana(word.kana, word.kanji).map((seg, i) =>
              seg.reading ? (
                <ruby key={i}>
                  {seg.text}
                  <rt className='text-xs font-normal text-leaf-muted'>{seg.reading}</rt>
                </ruby>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </span>
        ) : null}

        {/* Meaning */}
        <p className='text-sm text-center leading-relaxed text-leaf-text'>
          {word.meaning_zh}
        </p>

        {/* Meta row: pos + pitch accent */}
        <div className='flex items-center gap-3'>
          {word.pos && word.pos.length > 0 && (
            <span className='text-xs text-leaf-note'>{word.pos.join(' · ')}</span>
          )}
          {word.pitch_accent !== null && (
            <span className='text-xs text-leaf-note'>声调 {word.pitch_accent}</span>
          )}
        </div>

        {/* Example sentence */}
        {(word.example_ja || word.example_zh) && (
          <div className='w-full rounded-xl p-3 flex flex-col gap-1 bg-leaf-bg'>
            {word.example_ja && (
              <div className='flex items-start gap-2'>
                <span
                  className='text-xs leading-relaxed text-leaf-deep'
                  style={{ whiteSpace: 'nowrap' }}
                >
                  例文
                </span>
                <span className='text-xs leading-relaxed text-leaf-text'>
                  {word.example_ja}
                </span>
                {word.audio_example_url && (
                  <AudioButton
                    text={word.example_ja}
                    audioUrl={word.audio_example_url}
                    size='sm'
                  />
                )}
              </div>
            )}
            {word.example_zh && (
              <div className='flex items-start gap-2'>
                <span
                  className='text-xs leading-relaxed text-[#9AAA9A]'
                  style={{ whiteSpace: 'nowrap' }}
                >
                  释义
                </span>
                <span className='text-xs leading-relaxed text-[#7A8A7A]'>
                  {word.example_zh}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {word.notes && (
          <p className='text-xs text-center leading-relaxed text-[#9AAA9A]'>
            {word.notes}
          </p>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className='text-xs transition-colors text-leaf-faint hover:text-leaf'
        >
          关闭
        </button>
      </div>
    </div>
  )
}
