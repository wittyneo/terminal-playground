import { useState } from 'react'
import { lessons, categories, type Category } from '../data/lessons'
import './Cheatsheet.css'

interface Props {
  isOpen: boolean
  currentLessonIndex: number
  onClose: () => void
  onGoToLesson: (index: number) => void
}

export function Cheatsheet({ isOpen, currentLessonIndex, onClose, onGoToLesson }: Props) {
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? lessons : lessons.filter(l => l.category === filter)

  function handleTry(lessonIndex: number) {
    onGoToLesson(lessonIndex)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="cs-backdrop" onClick={onClose} />}

      {/* Panel */}
      <div className={`cs-panel ${isOpen ? 'cs-panel--open' : ''}`}>
        <div className="cs-header">
          <span className="cs-header__title">Cheatsheet</span>
          <button className="cs-header__close" onClick={onClose} aria-label="Close cheatsheet">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Category filters */}
        <div className="cs-filters">
          <button
            className={`cs-filter ${filter === 'ALL' ? 'cs-filter--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cs-filter ${filter === cat ? 'cs-filter--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'CLAUDE CODE' ? 'Claude' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Command list */}
        <div className="cs-list">
          {filtered.map((lesson) => {
            const lessonIndex = lesson.id - 1
            const isCurrent = lessonIndex === currentLessonIndex
            return (
              <div
                key={lesson.id}
                className={`cs-item ${isCurrent ? 'cs-item--current' : ''} ${lesson.isDanger ? 'cs-item--danger' : ''}`}
              >
                <div className="cs-item__body">
                  <span className="cs-item__usecase">{lesson.useCase}</span>
                  <code className="cs-item__cmd">{lesson.commandLabel}</code>
                </div>
                <button
                  className="cs-item__try"
                  onClick={() => handleTry(lessonIndex)}
                  aria-label={`Try ${lesson.commandLabel}`}
                >
                  Try it →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
