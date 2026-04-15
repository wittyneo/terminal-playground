import { useEffect, useRef, KeyboardEvent } from 'react'
import type { HistoryEntry, HuntState } from '../hooks/useHunt'
import type { Hunt } from '../data/hunts'
import './HuntTerminal.css'

const TARGET_PREFIX = '__TARGET__:'

interface Props {
  hunt: Hunt
  currentPath: string[]
  history: HistoryEntry[]
  huntState: HuntState
  inputValue: string
  setInputValue: (v: string) => void
  isLastHunt: boolean
  onSubmit: (input: string) => void
  onNextHunt: () => void
}

export function HuntTerminal({
  hunt,
  currentPath,
  history,
  huntState,
  inputValue,
  setInputValue,
  isLastHunt,
  onSubmit,
  onNextHunt,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef  = useRef<HTMLDivElement>(null)

  const promptPath = currentPath.join('/')
  const isActive  = huntState === 'active'
  const isSuccess = huntState === 'success'

  // Focus input when active
  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive, history.length])

  // Scroll to bottom whenever history grows
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history.length, huntState])

  // Enter key to go to next hunt when in success state
  useEffect(() => {
    if (!isSuccess || isLastHunt) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter') onNextHunt()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isSuccess, isLastHunt, onNextHunt])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit(inputValue)
  }

  const terminalClass = [
    'hunt-terminal',
    isSuccess ? 'hunt-terminal--success' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={terminalClass}>
      {/* Title bar */}
      <div className="hunt-terminal__titlebar">
        <div className="hunt-terminal__dots">
          <span className="hunt-terminal__dot hunt-terminal__dot--red" />
          <span className="hunt-terminal__dot hunt-terminal__dot--yellow" />
          <span className="hunt-terminal__dot hunt-terminal__dot--green" />
        </div>
        {isActive && (
          <div className="hunt-terminal__shortcuts">
            <span className="hunt-terminal__shortcut">
              <kbd>↵</kbd> submit
            </span>
            <span className="hunt-terminal__shortcut-sep">·</span>
            <span className="hunt-terminal__shortcut">
              ls · cd · pwd
            </span>
          </div>
        )}
        {isSuccess && (
          <span className="hunt-terminal__success-label">✓ target found</span>
        )}
      </div>

      {/* Scrollable command history */}
      <div className="hunt-terminal__body" ref={bodyRef}>
        {/* Past history entries */}
        {history.map((entry, i) => (
          <div key={i} className="hunt-terminal__entry">
            {/* The command that was typed */}
            <div className="hunt-terminal__line">
              <span className="hunt-terminal__user">user@void</span>
              <span className="hunt-terminal__sep"> : </span>
              <span className="hunt-terminal__path">{entry.path.join('/')}</span>
              <span className="hunt-terminal__sep"> $ </span>
              <span className={`hunt-terminal__typed ${entry.isError ? 'hunt-terminal__typed--error' : ''}`}>
                {entry.command}
              </span>
            </div>

            {/* Output lines */}
            {entry.output.length > 0 && (
              <div className="hunt-terminal__output">
                {entry.output.map((line, j) => {
                  const isTarget = line.startsWith(TARGET_PREFIX)
                  const display  = isTarget ? line.slice(TARGET_PREFIX.length) : line
                  return (
                    <div
                      key={j}
                      className={`hunt-terminal__output-line ${isTarget ? 'hunt-terminal__output-line--target' : ''} ${entry.isError ? 'hunt-terminal__output-line--error' : ''}`}
                      style={{ animationDelay: `${j * 30}ms` }}
                    >
                      {isTarget && <span className="hunt-terminal__target-glyph">◎ </span>}
                      {display || '\u00A0'}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Live input line */}
        {isActive && (
          <div className="hunt-terminal__entry">
            <div className="hunt-terminal__line">
              <span className="hunt-terminal__user">user@void</span>
              <span className="hunt-terminal__sep"> : </span>
              <span className="hunt-terminal__path">{promptPath}</span>
              <span className="hunt-terminal__sep"> $ </span>
              <span className="hunt-terminal__typed">
                {inputValue}
                <span className="hunt-terminal__cursor" />
              </span>
            </div>
            <input
              ref={inputRef}
              className="hunt-terminal__input"
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
          </div>
        )}
      </div>

      {/* Success footer */}
      {isSuccess && (
        <div className="hunt-terminal__footer">
          <div className="hunt-terminal__footer-msg">
            <span className="hunt-terminal__footer-icon">✓</span>
            <span>{hunt.successMessage}</span>
          </div>
          {!isLastHunt ? (
            <button className="hunt-terminal__next-btn" onClick={onNextHunt}>
              Next hunt <span className="hunt-terminal__next-arrow">→</span>
            </button>
          ) : (
            <span className="hunt-terminal__complete-badge">✦ All hunts complete</span>
          )}
        </div>
      )}
    </div>
  )
}
