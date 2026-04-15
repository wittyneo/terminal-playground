import type { Lesson } from '../data/lessons'
import './CommandCard.css'

interface Props {
  lesson: Lesson
}

export function CommandCard({ lesson }: Props) {
  if (!lesson.flags || lesson.flags.length === 0) return null

  return (
    <div className="cmd-card cmd-card--flags">
      <div className="cmd-card__header">
        <span className="cmd-card__icon cmd-card__icon--dim">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 2v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M3 2h8l-2 4h2l-2 4H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="cmd-card__label">FLAGS</span>
      </div>
      <ul className="cmd-flags">
        {lesson.flags.map((f) => (
          <li key={f.flag} className="cmd-flag">
            <code className="cmd-flag__name">{f.flag}</code>
            <span className="cmd-flag__desc">{f.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
