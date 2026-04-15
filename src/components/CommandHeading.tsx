import { lessons } from '../data/lessons'
import type { Lesson } from '../data/lessons'
import './CommandHeading.css'

interface Props {
  lesson: Lesson
}

export function CommandHeading({ lesson }: Props) {
  const categoryLessons = lessons.filter(l => l.category === lesson.category)
  const positionInCategory = categoryLessons.findIndex(l => l.id === lesson.id) + 1
  const totalInCategory = categoryLessons.length

  return (
    <div className="cmd-heading">
      {/* Meta header: category + within-category progress */}
      <div className="cmd-heading__meta">
        <span className="cmd-heading__category">{lesson.category}</span>
        <span className="cmd-heading__meta-sep">·</span>
        <span className="cmd-heading__progress">
          <span className="cmd-heading__progress-current">{positionInCategory}</span>
          <span className="cmd-heading__progress-sep"> / </span>
          <span className="cmd-heading__progress-total">{totalInCategory}</span>
        </span>
        <div className="cmd-heading__progress-dots">
          {categoryLessons.map((_, i) => (
            <span
              key={i}
              className={`cmd-heading__dot ${i < positionInCategory ? 'cmd-heading__dot--filled' : ''}`}
            />
          ))}
        </div>
      </div>

      <h1 className="cmd-heading__title">{lesson.commandLabel}</h1>
      <p className="cmd-heading__desc">{lesson.description}</p>

      {lesson.flags && lesson.flags.length > 0 && (
        <div className="cmd-heading__flags">
          {lesson.flags.map((f) => (
            <span key={f.flag} className="cmd-heading__flag">
              <code className="cmd-heading__flag-name">{f.flag}</code>
              <span className="cmd-heading__flag-desc">{f.description}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
