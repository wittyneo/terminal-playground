import { useState } from 'react'
import { Navbar } from './Navbar'
import { CategoryTabs } from './CategoryTabs'
import { FileTree } from './FileTree'
import { CommandHeading } from './CommandHeading'
import { Terminal } from './Terminal'
import { ProTipCard } from './ProTipCard'
import { Cheatsheet } from './Cheatsheet'
import { useLesson } from '../hooks/useLesson'
import './LessonView.css'

interface Props {
  onEnterHunt: () => void
  onEnterPest: () => void
}

export function LessonView({ onEnterHunt, onEnterPest }: Props) {
  const {
    lesson,
    lessonIndex,
    isLast,
    terminalState,
    inputValue,
    setInputValue,
    showOutput,
    showHint,
    submitCommand,
    confirmDanger,
    cancelDanger,
    goNext,
    goToLesson,
    goToCategory,
  } = useLesson()

  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
  const isDangerWarn = terminalState === 'danger-warn'

  return (
    <div className="lesson-layout">
      {/* Cheatsheet vertical tab */}
      <button
        className={`cs-tab ${cheatsheetOpen ? 'cs-tab--open' : ''}`}
        onClick={() => setCheatsheetOpen(o => !o)}
        aria-label="Toggle cheatsheet"
      >
        <span className="cs-tab__text">Cheatsheet</span>
        <span className="cs-tab__arrow">{cheatsheetOpen ? '←' : '→'}</span>
      </button>

      <Cheatsheet
        isOpen={cheatsheetOpen}
        currentLessonIndex={lessonIndex}
        onClose={() => setCheatsheetOpen(false)}
        onGoToLesson={goToLesson}
      />

      <Navbar
        right={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="hunt-mode-btn" onClick={onEnterPest}>
              Pest Hunt ⚠
            </button>
            <button className="hunt-mode-btn" onClick={onEnterHunt}>
              Hunt Mode →
            </button>
          </div>
        }
      />

      <CategoryTabs
        activeCategory={lesson.category}
        onSelectCategory={goToCategory}
      />

      {/* Three-column content area */}
      <div className="lesson-content" key={lessonIndex}>
        <div className="lesson-col lesson-col--left">
          <FileTree currentPrompt={lesson.prompt} category={lesson.category} />
        </div>

        <div className="lesson-col lesson-col--center">
          <CommandHeading lesson={lesson} />
          <div className="terminal-glow-wrap">
            <div className="terminal-glow" />
            <Terminal
              lesson={lesson}
              terminalState={terminalState}
              inputValue={inputValue}
              setInputValue={setInputValue}
              showOutput={showOutput}
              showHint={showHint}
              isLast={isLast}
              onSubmit={submitCommand}
              onConfirmDanger={confirmDanger}
              onCancelDanger={cancelDanger}
              onGoNext={goNext}
            />
          </div>
        </div>

        <div className="lesson-col lesson-col--right">
          <ProTipCard lesson={lesson} lessonIndex={lessonIndex} />
        </div>
      </div>

      {/* Bottom hint bar */}
      <div className="lesson-cta">
        {isDangerWarn && (
          <div className="cta-info cta-info--danger">
            <span className="cta-info__text">⚠ Confirm or cancel in the terminal</span>
          </div>
        )}
      </div>
    </div>
  )
}
