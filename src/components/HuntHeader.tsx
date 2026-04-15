import { hunts } from '../data/hunts'
import type { Hunt } from '../data/hunts'
import './HuntHeader.css'

interface Props {
  hunt: Hunt
  huntIndex: number
  commandCount: number
}

export function HuntHeader({ hunt, huntIndex, commandCount }: Props) {
  const total = hunts.length

  return (
    <div className="hunt-header">
      <div className="hunt-header__meta">
        <span className="hunt-header__mode-badge">HUNT MODE</span>
        <span className="hunt-header__sep">·</span>
        <span className="hunt-header__progress">
          <span className="hunt-header__progress-current">{huntIndex + 1}</span>
          <span className="hunt-header__progress-sep"> / </span>
          <span className="hunt-header__progress-total">{total}</span>
        </span>
        <div className="hunt-header__dots">
          {hunts.map((_, i) => (
            <span
              key={i}
              className={`hunt-header__dot ${i <= huntIndex ? 'hunt-header__dot--filled' : ''}`}
            />
          ))}
        </div>
        <span className="hunt-header__cmd-count">{commandCount} cmd{commandCount !== 1 ? 's' : ''}</span>
      </div>

      <h1 className="hunt-header__title">{hunt.title}</h1>
      <p className="hunt-header__brief">{hunt.brief}</p>
    </div>
  )
}
