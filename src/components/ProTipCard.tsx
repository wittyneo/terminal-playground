import type { Lesson } from '../data/lessons'
import './ProTipCard.css'

interface Props {
  lesson: Lesson
  lessonIndex: number
}

// Rotating decorative glyphs per lesson — gives the void aesthetic
const GLYPHS = ['◈', '⬡', '◉', '⬢', '◎', '⊛', '⬟', '◍', '⊙', '◈', '⬡', '◉', '⬢', '◎']

export function ProTipCard({ lesson, lessonIndex }: Props) {
  const glyph = GLYPHS[lessonIndex % GLYPHS.length]

  return (
    <div className="tip-panel">
      <div className="tip-card">
        <div className="tip-card__header">
          <span className="tip-card__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 9v4M6 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="tip-card__label">PRO TIP</span>
        </div>
        <p className="tip-card__text">{lesson.proTip}</p>
      </div>

      {/* Decorative environment card */}
      <div className="tip-env">
        <div className="tip-env__glyph">{glyph}</div>
        <div className="tip-env__info">
          <span className="tip-env__label">ENVIRONMENT</span>
          <span className="tip-env__name">Virtual Core v.01</span>
        </div>
      </div>
    </div>
  )
}
