import { useEffect, useRef, KeyboardEvent } from 'react'
import type { Lesson } from '../data/lessons'
import type { TerminalState } from '../hooks/useLesson'
import './Terminal.css'

interface Props {
  lesson: Lesson
  terminalState: TerminalState
  inputValue: string
  setInputValue: (val: string) => void
  showOutput: boolean
  showHint: boolean
  isLast: boolean
  onSubmit: (input: string) => void
  onConfirmDanger: () => void
  onCancelDanger: () => void
  onGoNext: () => void
}

export function Terminal({
  lesson,
  terminalState,
  inputValue,
  setInputValue,
  showOutput,
  showHint,
  isLast,
  onSubmit,
  onConfirmDanger,
  onCancelDanger,
  onGoNext,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalState === 'active') inputRef.current?.focus()
  }, [terminalState])

  useEffect(() => {
    if (terminalState !== 'success' || isLast) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter') onGoNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [terminalState, isLast, onGoNext])

  useEffect(() => {
    if (showOutput && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [showOutput])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit(inputValue)
    if (e.key === 'Tab') {
      e.preventDefault()
      setInputValue(lesson.acceptedInputs[0])
    }
  }

  const isActive     = terminalState === 'active' || terminalState === 'error'
  const isSuccess    = terminalState === 'success'
  const isDangerWarn = terminalState === 'danger-warn'

  const terminalClass = [
    'terminal',
    terminalState === 'error' ? 'terminal--error'   : '',
    isSuccess                 ? 'terminal--success' : '',
    isDangerWarn              ? 'terminal--danger'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={terminalClass}>
      {/* Title bar — traffic lights left, shortcuts right */}
      <div className="terminal__titlebar">
        <div className="terminal__dots">
          <span className="terminal__dot terminal__dot--red" />
          <span className="terminal__dot terminal__dot--yellow" />
          <span className="terminal__dot terminal__dot--green" />
        </div>
        {isActive && (
          <div className="terminal__shortcuts">
            <span className="terminal__shortcut">
              <kbd>↵</kbd> submit
            </span>
            <span className="terminal__shortcut-sep">·</span>
            <span className="terminal__shortcut">
              <kbd>⇥</kbd> autocomplete
            </span>
          </div>
        )}
      </div>

      {/* Scrollable body — prompt + output + hint */}
      <div className="terminal__body" ref={bodyRef}>
        <div className="terminal__line">
          <span className="terminal__user">user@void</span>
          <span className="terminal__sep"> : </span>
          <span className="terminal__path">~/{lesson.prompt.replace('~/', '')}</span>
          <span className="terminal__sep"> $ </span>
          <span className="terminal__typed">
            {isActive ? inputValue : lesson.acceptedInputs[0]}
            {isActive && <span className="terminal__cursor" />}
          </span>
        </div>

        {isActive && (
          <input
            ref={inputRef}
            className="terminal__input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Type terminal command"
          />
        )}

        {showOutput && lesson.simulatedOutput.length > 0 && (
          <div className="terminal__output">
            {lesson.simulatedOutput.map((line, i) => (
              <div
                key={i}
                className="terminal__output-line"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        )}

        {showHint && isActive && (
          <div className="terminal__hint">
            <span className="terminal__hint-label">HINT</span>
            Try typing:{' '}
            <code className="terminal__hint-code">{lesson.acceptedInputs[0]}</code>
          </div>
        )}
      </div>

      {/* Sticky footer — success / danger / nothing */}
      {(isSuccess || isDangerWarn) && (
        <div className={`terminal__footer ${isSuccess ? 'terminal__footer--success' : 'terminal__footer--danger'}`}>
          {isSuccess && (
            <>
              <div className="terminal__footer-msg">
                <span className="terminal__footer-icon">✓</span>
                <span>{lesson.successMessage}</span>
              </div>
              {!isLast ? (
                <button className="terminal__next-btn" onClick={onGoNext}>
                  Next command <span className="terminal__next-arrow">→</span>
                </button>
              ) : (
                <span className="terminal__complete-badge">✦ All done</span>
              )}
            </>
          )}

          {isDangerWarn && (
            <>
              <div className="terminal__footer-msg">
                <span className="terminal__footer-icon terminal__footer-icon--warn">⚠</span>
                <span>
                  <strong>rm deletes permanently.</strong> No trash. No undo. Confirm?
                </span>
              </div>
              <div className="terminal__danger-actions">
                <button className="terminal__danger-btn terminal__danger-btn--confirm" onClick={onConfirmDanger}>
                  Yes, delete it
                </button>
                <button className="terminal__danger-btn terminal__danger-btn--cancel" onClick={onCancelDanger}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
