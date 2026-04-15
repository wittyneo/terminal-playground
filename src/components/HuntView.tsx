import { HuntHeader }   from './HuntHeader'
import { HuntFileTree } from './HuntFileTree'
import { HuntTerminal } from './HuntTerminal'
import { useHunt }      from '../hooks/useHunt'
import './HuntView.css'

interface Props {
  onExitHunt: () => void
}

export function HuntView({ onExitHunt }: Props) {
  const {
    hunt,
    huntIndex,
    totalHunts,
    isLastHunt,
    currentPath,
    history,
    huntState,
    inputValue,
    setInputValue,
    submitCommand,
    goNextHunt,
    resetHunt,
    commandCount,
  } = useHunt()

  return (
    <div className="hunt-layout">
      {/* Top bar */}
      <div className="hunt-topbar">
        <div className="hunt-topbar__brand">
          <svg className="hunt-topbar__logo" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
            <circle cx="12" cy="12" r="7"  stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
            <circle cx="12" cy="12" r="4"  stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
            <circle cx="12" cy="12" r="2"  fill="currentColor" />
          </svg>
          Terminal Void
        </div>

        <div className="hunt-topbar__controls">
          <span className="hunt-topbar__hunt-count">{huntIndex + 1} / {totalHunts}</span>
          <button className="hunt-topbar__reset-btn" onClick={resetHunt} aria-label="Reset hunt">
            ↺ reset
          </button>
          <button className="hunt-topbar__exit-btn" onClick={onExitHunt}>
            ← Tutorial
          </button>
        </div>
      </div>

      {/* Three-column content */}
      <div className="hunt-content">
        {/* Left — file tree */}
        <div className="hunt-col hunt-col--left">
          <HuntFileTree
            currentPath={currentPath}
            targetDir={hunt.targetDir}
            targetFile={hunt.targetFile}
          />
        </div>

        {/* Center — header + terminal */}
        <div className="hunt-col hunt-col--center">
          <HuntHeader
            hunt={hunt}
            huntIndex={huntIndex}
            commandCount={commandCount}
          />
          <div className="hunt-terminal-glow-wrap">
            <div className="hunt-terminal-glow" />
            <HuntTerminal
              hunt={hunt}
              currentPath={currentPath}
              history={history}
              huntState={huntState}
              inputValue={inputValue}
              setInputValue={setInputValue}
              isLastHunt={isLastHunt}
              onSubmit={submitCommand}
              onNextHunt={goNextHunt}
            />
          </div>
        </div>

        {/* Right — command reference */}
        <div className="hunt-col hunt-col--right">
          <div className="hunt-ref-card">
            <div className="hunt-ref-card__header">
              <span className="hunt-ref-card__icon">⌨</span>
              <span className="hunt-ref-card__label">COMMANDS</span>
            </div>
            <ul className="hunt-ref-card__list">
              <li className="hunt-ref-card__item">
                <code className="hunt-ref-card__cmd">ls</code>
                <span className="hunt-ref-card__desc">list contents of current folder</span>
              </li>
              <li className="hunt-ref-card__item">
                <code className="hunt-ref-card__cmd">cd folder</code>
                <span className="hunt-ref-card__desc">move into a folder</span>
              </li>
              <li className="hunt-ref-card__item">
                <code className="hunt-ref-card__cmd">cd ..</code>
                <span className="hunt-ref-card__desc">go up one level</span>
              </li>
              <li className="hunt-ref-card__item">
                <code className="hunt-ref-card__cmd">cd ~</code>
                <span className="hunt-ref-card__desc">jump to home</span>
              </li>
              <li className="hunt-ref-card__item">
                <code className="hunt-ref-card__cmd">pwd</code>
                <span className="hunt-ref-card__desc">print current path</span>
              </li>
            </ul>
            <p className="hunt-ref-card__tip">
              Navigate to the glowing folder in the file tree, then run <code>ls</code> to find the target.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
