import React, { useState, useEffect, useRef } from 'react'
import './LandingPage.css'

// ── Concern Terminal (Section 01) ─────────────────────────────────

type ConcernPhase = 'waiting' | 'output' | 'exe' | 'launched' | 'done'

function ConcernTerminal({ items }: { items: Concern[] }) {
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [phase, setPhase]                 = useState<ConcernPhase>('waiting')
  const [displayedText, setDisplayedText] = useState('')
  const [typingDone, setTypingDone]       = useState(false)
  const [showText, setShowText]           = useState(false)
  const [windowOpen, setWindowOpen]       = useState(false)

  const termRef  = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const concern = items[currentIndex]
  const isLast  = currentIndex === items.length - 1
  const atStart = currentIndex === 0 && phase === 'waiting'

  // Drive typing — with optional pre-delay for imageFirst concerns
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (phase !== 'output') {
      setDisplayedText('')
      setTypingDone(false)
      setShowText(false)
      return
    }

    const startTyping = () => {
      setShowText(true)
      const text = concern.reframe
      let i = 0
      setDisplayedText('')
      setTypingDone(false)
      const tick = () => {
        i++
        setDisplayedText(text.slice(0, i))
        if (i < text.length) {
          timerRef.current = setTimeout(tick, 28)
        } else {
          setTypingDone(true)
        }
      }
      timerRef.current = setTimeout(tick, 28)
    }

    if (concern.imageFirst) {
      setShowText(false)
      timerRef.current = setTimeout(startTyping, concern.textDelay ?? 10000)
    } else {
      startTyping()
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { termRef.current?.focus({ preventScroll: true }) }, [phase, currentIndex])

  const advance = () => {
    if (phase === 'waiting') {
      setPhase('output')
    } else if (phase === 'output') {
      if (isLast) {
        setPhase('exe')
      } else {
        setCurrentIndex(i => i + 1)
        setPhase('waiting')
      }
    } else if (phase === 'exe') {
      setPhase('launched')
      setWindowOpen(true)
    } else if (phase === 'launched' && !windowOpen) {
      setPhase('done')
    }
  }

  const back = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (phase === 'done') {
      setPhase('launched')
    } else if (phase === 'launched') {
      setWindowOpen(false)
      setPhase('exe')
    } else if (phase === 'exe') {
      setPhase('output')
    } else if (phase === 'output') {
      setPhase('waiting')
    } else if (phase === 'waiting' && currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      setPhase('output')
    }
  }

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setWindowOpen(false)
    setCurrentIndex(0)
    setPhase('waiting')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight') advance()
    else if (e.key === 'ArrowLeft') back()
  }

  const advanceBtnLabel = 'enter'

  return (
    <>
      {windowOpen && <TermWindow onClose={() => setWindowOpen(false)} />}
      <div
        className="ct"
        ref={termRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => termRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="ct__titlebar">
          <div className="ct__dots">
            <span className="ct__dot ct__dot--red" />
            <span className="ct__dot ct__dot--yellow" />
            <span className="ct__dot ct__dot--green" />
          </div>
          <span className="ct__label">designer@void — ~/concerns</span>
          <div className="ct__titlebar-action">
            <button
              className="ct__enter-btn"
              onClick={advance}
              style={{ visibility: (phase === 'done' || (phase === 'launched' && windowOpen)) ? 'hidden' : 'visible' }}
            >
              <kbd>↵</kbd>
              <span className="ct__enter-btn-label">{advanceBtnLabel}</span>
            </button>
            <span className="ct__titlebar-sep" />
            <button
              className={`ct__reset-btn${atStart ? ' ct__reset-btn--dim' : ''}`}
              onClick={back}
              title="Back"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <polyline points="6,2 2,6 6,10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
              <span>back</span>
            </button>
            <button
              className={`ct__reset-btn${atStart ? ' ct__reset-btn--dim' : ''}`}
              onClick={reset}
              title="Reset"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10.5 6A4.5 4.5 0 1 1 7 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                <polyline points="6.8,0.3 6.8,2.6 9.1,2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>reset</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ct__body">
          {phase === 'exe' && (
            <div className="ct__prompt-line">
              <span className="ct__ps1">designer@void</span>
              <span className="ct__sep">:</span>
              <span className="ct__path">~/concerns</span>
              <span className="ct__dollar"> $ </span>
              <span className="ct__cmd">
                ./terms-encounter.exe<span className="ct__cursor" />
              </span>
            </div>
          )}

          {(phase === 'launched' || phase === 'done') && (
            <>
              <div className="ct__prompt-line">
                <span className="ct__ps1">designer@void</span>
                <span className="ct__sep">:</span>
                <span className="ct__path">~/concerns</span>
                <span className="ct__dollar"> $ </span>
                <span className="ct__cmd">./terms-encounter.exe</span>
              </div>
              <div className="ct__output-block">
                {phase === 'done' ? (
                  <span className="ct__out-text ct__success">
                    ✓ all good — ready to launch terminal 🚀
                  </span>
                ) : (
                  <span className="ct__out-text ct__launching">
                    launching terms-encounter.exe<span className="ct__cursor" />
                  </span>
                )}
              </div>
            </>
          )}

          {(phase === 'waiting' || phase === 'output') && (
            <>
              <div className="ct__prompt-line">
                <span className="ct__ps1">designer@void</span>
                <span className="ct__sep">:</span>
                <span className="ct__path">~/concerns</span>
                <span className="ct__dollar"> $ </span>
                <span className="ct__cmd">
                  {concern.thought}
                  {phase === 'waiting' && <span className="ct__cursor" />}
                </span>
              </div>
              {phase === 'output' && (
                <div className="ct__output-block">
                  {concern.imageFirst && concern.images && (
                    <div className={`ct__out-imgs ct__out-imgs--${concern.imageSize ?? 'small'}`}>
                      {concern.images.map((src, idx) => (
                        <div key={idx} className="ct__out-img-wrap">
                          <img className="ct__out-img" src={src} alt="" />
                          {concern.imageCaptions?.[idx] && (
                            <span className="ct__out-img-caption">{concern.imageCaptions[idx]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {showText && (
                    <span className="ct__out-text">
                      {displayedText}
                      {!typingDone && <span className="ct__cursor" />}
                    </span>
                  )}
                  {!concern.imageFirst && typingDone && concern.images && (
                    <div className={`ct__out-imgs ct__out-imgs--${concern.imageSize ?? 'small'}`}>
                      {concern.images.map((src, idx) => (
                        <div key={idx} className="ct__out-img-wrap">
                          <img className="ct__out-img" src={src} alt="" />
                          {concern.imageCaptions?.[idx] && (
                            <span className="ct__out-img-caption">{concern.imageCaptions[idx]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="ct__progress-track">
          <div
            className="ct__progress-fill"
            style={{
              width: `${((phase === 'exe' || phase === 'launched' || phase === 'done') ? items.length : currentIndex) / items.length * 100}%`
            }}
          />
        </div>
      </div>
    </>
  )
}

// ── Shared helpers ────────────────────────────────────────────────

function Code({ children }: { children: string }) {
  return <code className="lp-code">{children}</code>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleCopy}
      title="Copy command"
      aria-label="Copy command"
    >
      {copied
        ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polyline points="1.5,7 5,10.5 11.5,2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {/* back document */}
            <rect x="4.5" y="0.5" width="9" height="10.5" rx="1.8" stroke="currentColor" strokeWidth="1.3"/>
            {/* front document — filled to occlude back rect corner */}
            <rect x="0.5" y="3" width="9" height="10.5" rx="1.8" fill="#080c12" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        )
      }
    </button>
  )
}

function ErrorCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`lp-error-card lp-error-card--accordion ${open ? 'lp-error-card--open' : ''}`}>
      <button className="lp-error-name" onClick={() => setOpen(o => !o)}>
        <Code>{title}</Code>
        <span className="lp-error-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="lp-error-body">{children}</div>}
    </div>
  )
}

function CommandRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="lp-cmd-row">
      <span className="lp-cmd-desc">{desc}</span>
      <div className="lp-cmd-row__actions">
        <Code>{cmd}</Code>
        <CopyButton text={cmd} />
      </div>
    </div>
  )
}

interface Concern {
  thought: string
  reframe: string
  images?: string[]
  imageCaptions?: string[]
  imageSize?: 'small' | 'medium' | 'large' | 'stacked'
  imageFirst?: boolean
  textDelay?: number
}

const concerns: Concern[] = [
  {
    thought: '"I\'ll break something"',
    reframe: '• As designers we\'re wired to think visually — a blank prompt with no buttons or cues is naturally unsettling.\n• There are checks and balances in place. As long as you\'re being conscious about what you run, it\'s very hard to break something.',
    images: ['/1.png'],
    imageSize: 'medium',
  },
  {
    thought: '"I need to memorise a lot"',
    reframe: 'You realistically need 8–10 commands. The rest you look up as you go.',
    images: ['/memorize.gif'],
    imageSize: 'small',
    imageFirst: true,
    textDelay: 10000,
  },
  {
    thought: '"AI tools can just do this for me"',
    reframe:
      'Knowing the terminal means you understand what AI is doing, can catch when it goes wrong, and can jump in when it gets stuck.',
  },
]

interface GlossaryEntry {
  term: string
  def: React.ReactNode
  label: string
  analogy: React.ReactNode
  svg: React.ReactNode
  image?: string
  isCommand?: boolean
  fullWidth?: boolean
}


const glossary: GlossaryEntry[] = [
  {
    term: 'Terminal',
    def: 'The app/window where you type commands',
    label: 'your window to the OS',
    analogy: 'The phone you use to call your personal assistant',
    image: '/PA1.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="3" y="3" width="90" height="54" rx="6" opacity="0.35"/>
        <line x1="3" y1="16" x2="93" y2="16" opacity="0.25"/>
        <circle cx="13" cy="9.5" r="2.5" fill="currentColor" opacity="0.55"/>
        <circle cx="22" cy="9.5" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="31" cy="9.5" r="2.5" fill="currentColor" opacity="0.15"/>
        <path d="M13 36L21 30L13 24" strokeWidth="2.2" opacity="0.9"/>
        <rect x="25" y="23" width="9" height="14" rx="1.5" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    term: 'Shell',
    def: 'The program that reads your commands and runs them',
    label: 'translates typing → actions',
    analogy: 'Your personal assistant — picks up, understands the task, and goes and does it',
    image: '/PA2.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="2" y="20" width="22" height="20" rx="4" opacity="0.4"/>
        <line x1="7" y1="27" x2="19" y2="27" opacity="0.5"/>
        <line x1="7" y1="33" x2="15" y2="33" opacity="0.3"/>
        <line x1="24" y1="30" x2="34" y2="30" opacity="0.6"/>
        <polyline points="31,26 35,30 31,34" opacity="0.6"/>
        <circle cx="48" cy="30" r="13" opacity="0.5"/>
        <path d="M43 28L48 23L53 28" strokeWidth="1.5" opacity="0.7"/>
        <line x1="48" y1="23" x2="48" y2="37" opacity="0.7"/>
        <line x1="62" y1="30" x2="72" y2="30" opacity="0.6"/>
        <polyline points="69,26 73,30 69,34" opacity="0.6"/>
        <rect x="72" y="20" width="22" height="20" rx="4" fill="currentColor" fillOpacity="0.1" opacity="0.7"/>
        <line x1="77" y1="27" x2="89" y2="27" opacity="0.5"/>
        <line x1="77" y1="33" x2="83" y2="33" opacity="0.3"/>
      </svg>
    ),
  },
  {
    term: 'Bash vs Zsh',
    def: 'Two versions of the same shell language — Zsh is the default on modern Macs',
    label: 'same language, two dialects',
    analogy: 'The veteran assistant calls a travel agent; the newer hire books directly from their phone. Same outcome, different method',
    image: '/PA3.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="4" y="4" width="36" height="20" rx="4" opacity="0.45"/>
        <line x1="9" y1="11" x2="34" y2="11" opacity="0.4"/>
        <line x1="9" y1="17" x2="26" y2="17" opacity="0.25"/>
        <rect x="56" y="4" width="36" height="20" rx="4" opacity="0.45"/>
        <line x1="61" y1="11" x2="86" y2="11" opacity="0.4"/>
        <line x1="61" y1="17" x2="78" y2="17" opacity="0.25"/>
        <line x1="22" y1="24" x2="42" y2="46" opacity="0.5"/>
        <line x1="74" y1="24" x2="54" y2="46" opacity="0.5"/>
        <rect x="32" y="44" width="32" height="13" rx="4" fill="currentColor" fillOpacity="0.1" opacity="0.8"/>
        <line x1="37" y1="50" x2="59" y2="50" opacity="0.5"/>
      </svg>
    ),
  },
  {
    term: '.zshrc',
    def: <>
      A config file that runs every time you open a new terminal tab — contains your environment variables, PATH, and other settings. Changes only apply when you start a new session.
      <br /><br />
      Open it: <Code>{'open ~/.zshrc'}</Code>
    </>,
    label: 'runs automatically on every open',
    analogy: 'The briefing doc your assistant gets when they first join — updates only take effect when they check it again',
    image: '/zsh.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="18" y="4" width="44" height="52" rx="4" opacity="0.4"/>
        <path d="M48 4L62 18H48V4Z" opacity="0.3"/>
        <line x1="26" y1="26" x2="54" y2="26" opacity="0.45"/>
        <line x1="26" y1="33" x2="50" y2="33" opacity="0.35"/>
        <line x1="26" y1="40" x2="46" y2="40" opacity="0.25"/>
        <path d="M66 22 C82 22 86 38 70 46" opacity="0.7" strokeDasharray="3 2"/>
        <polyline points="72,42 70,47 66,44" opacity="0.7"/>
      </svg>
    ),
  },
  {
    term: 'Environment Variable',
    def: <>
      A named value stored in .zshrc that your tools can read.
      <br /><br />
      Set one: <Code>{'export ANTHROPIC_API_KEY="sk-ant-..."'}</Code>
      <br />
      Check if set: <Code>{'echo $ANTHROPIC_API_KEY'}</Code>
    </>,
    label: 'a named slot your tools read from',
    analogy: <>One specific line in the briefing doc — e.g. <Code>FREQUENT_FLYER=AI9823</Code>. Passed automatically to whoever needs it</>,
    image: '/zsh.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="4" y="18" width="30" height="24" rx="4" opacity="0.45"/>
        <line x1="10" y1="27" x2="28" y2="27" opacity="0.5"/>
        <line x1="10" y1="33" x2="24" y2="33" opacity="0.3"/>
        <line x1="38" y1="27" x2="46" y2="27" opacity="0.7"/>
        <line x1="38" y1="33" x2="46" y2="33" opacity="0.7"/>
        <rect x="50" y="18" width="42" height="24" rx="4" fill="currentColor" fillOpacity="0.08" opacity="0.8"/>
        <circle cx="61" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
        <circle cx="71" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
        <circle cx="81" cy="30" r="2.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  },
  {
    term: 'PATH',
    def: <>
      The list of folders the shell searches when you type a command.
      <br /><br />
      See your PATH: <Code>{'echo $PATH'}</Code>
      <br />
      Check where a tool lives: <Code>{'which node'}</Code>
    </>,
    label: 'the lookup list for every command',
    analogy: "The list of platforms your assistant has login access to. If it's not listed, they simply cannot use it",
    image: '/path.png',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <path d="M4 20 L4 44 L24 44 L24 24 L16 24 L13 20 Z" opacity="0.45"/>
        <line x1="25" y1="32" x2="33" y2="32" opacity="0.5"/>
        <polyline points="30,28 34,32 30,36" opacity="0.5"/>
        <path d="M34 20 L34 44 L54 44 L54 24 L46 24 L43 20 Z" opacity="0.45"/>
        <line x1="55" y1="32" x2="63" y2="32" opacity="0.5"/>
        <polyline points="60,28 64,32 60,36" opacity="0.5"/>
        <path d="M64 20 L64 44 L84 44 L84 24 L76 24 L73 20 Z" fill="currentColor" fillOpacity="0.08" opacity="0.7"/>
        <circle cx="74" cy="33" r="4" opacity="0.6"/>
        <line x1="77" y1="36" x2="80" y2="39" opacity="0.6"/>
      </svg>
    ),
  },
  {
    term: 'grep',
    isCommand: true,
    def: <>
      Searches through files or output for lines matching a pattern.
      <br /><br />
      <Code>{'grep "error" <filename>'}</Code>
      <br />
      Search recursively: <Code>{'grep -r "token" <folder>/'}</Code>
    </>,
    label: 'find any line matching a pattern',
    analogy: 'Asking your assistant to go through every page of a report and highlight every line that mentions a specific word',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <line x1="8" y1="12" x2="52" y2="12" opacity="0.3"/>
        <line x1="8" y1="21" x2="52" y2="21" opacity="0.3"/>
        <rect x="8" y="27" width="30" height="8" rx="2" fill="currentColor" fillOpacity="0.18"/>
        <line x1="8" y1="31" x2="38" y2="31" opacity="0.8" strokeWidth="2"/>
        <line x1="8" y1="40" x2="52" y2="40" opacity="0.3"/>
        <line x1="8" y1="49" x2="42" y2="49" opacity="0.3"/>
        <circle cx="72" cy="28" r="13" opacity="0.45"/>
        <line x1="81" y1="38" x2="91" y2="49" strokeWidth="2.5" opacity="0.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    term: 'shell script',
    fullWidth: true,
    def: <>
      A file of shell commands that run in sequence — like a saved macro for the terminal. Ends in <Code>{'.sh'}</Code>.
      <br /><br />
      Run one: <Code>{'bash script.sh'}</Code>
    </>,
    label: 'a saved sequence of commands',
    analogy: 'A printed checklist you hand your assistant — they follow every step in order, every time, without you having to repeat yourself',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="6" y="4" width="54" height="52" rx="4" opacity="0.35"/>
        <circle cx="16" cy="17" r="3" fill="currentColor" opacity="0.55"/>
        <line x1="24" y1="17" x2="52" y2="17" opacity="0.4"/>
        <circle cx="16" cy="29" r="3" fill="currentColor" opacity="0.4"/>
        <line x1="24" y1="29" x2="48" y2="29" opacity="0.35"/>
        <circle cx="16" cy="41" r="3" fill="currentColor" opacity="0.3"/>
        <line x1="24" y1="41" x2="50" y2="41" opacity="0.3"/>
        <line x1="70" y1="30" x2="84" y2="30" opacity="0.7"/>
        <polyline points="81,26 85,30 81,34" opacity="0.7"/>
      </svg>
    ),
  },
  {
    term: 'curl',
    isCommand: true,
    def: <>
      A command that makes an HTTP request directly from the terminal.
      <br /><br />
      <Code>{'curl https://api.example.com/status'}</Code>
    </>,
    label: 'HTTP calls straight from the terminal',
    analogy: 'Asking your assistant to call the hotel and confirm your booking — one direct call, one confirmation back',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        <rect x="2" y="14" width="28" height="32" rx="4" opacity="0.4"/>
        <line x1="2" y1="24" x2="30" y2="24" opacity="0.25"/>
        <path d="M7 36L13 30L7 24" strokeWidth="2" opacity="0.7"/>
        <rect x="17" y="24" width="7" height="10" rx="1" fill="currentColor" opacity="0.45"/>
        <line x1="32" y1="26" x2="62" y2="26" opacity="0.65"/>
        <polyline points="59,22 63,26 59,30" opacity="0.65"/>
        <line x1="62" y1="34" x2="32" y2="34" opacity="0.45" strokeDasharray="3 2"/>
        <polyline points="35,30 31,34 35,38" opacity="0.45"/>
        <rect x="64" y="14" width="30" height="32" rx="4" fill="currentColor" fillOpacity="0.08" opacity="0.8"/>
        <line x1="64" y1="26" x2="94" y2="26" opacity="0.3"/>
        <line x1="64" y1="38" x2="94" y2="38" opacity="0.3"/>
        <circle cx="72" cy="20" r="2" fill="currentColor" opacity="0.4"/>
        <circle cx="79" cy="20" r="2" fill="currentColor" opacity="0.25"/>
      </svg>
    ),
  },
  {
    term: 'echo',
    isCommand: true,
    def: <>
      Prints text or the value of a variable directly to the terminal.
      <br /><br />
      Print text: <Code>{'echo "Hello"'}</Code>
      <br />
      Check a variable: <Code>{'echo $PATH'}</Code>
    </>,
    label: 'reads back what a value actually is',
    analogy: 'Asking your assistant to read out loud what is written on a sticky note — useful for confirming what is actually stored there',
    svg: (
      <svg viewBox="0 0 96 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lp-gv-svg">
        {/* Terminal window */}
        <rect x="4" y="6" width="88" height="48" rx="6" opacity="0.35"/>
        <line x1="4" y1="18" x2="92" y2="18" opacity="0.2"/>
        <circle cx="13" cy="12" r="2.5" fill="currentColor" opacity="0.5"/>
        <circle cx="21" cy="12" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="29" cy="12" r="2.5" fill="currentColor" opacity="0.15"/>
        {/* Input line */}
        <path d="M13 30L18 26L13 22" strokeWidth="1.8" opacity="0.6"/>
        <line x1="22" y1="26" x2="50" y2="26" opacity="0.5"/>
        {/* Output line — brighter, slightly indented */}
        <line x1="13" y1="38" x2="55" y2="38" opacity="0.9" strokeWidth="2"/>
        <rect x="13" y="34" width="42" height="8" rx="2" fill="currentColor" fillOpacity="0.1"/>
      </svg>
    ),
  },
]

// ── Terms Encounter Window ────────────────────────────────────────

function TermWindow({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(20, (window.innerWidth - 680) / 2),
    y: 50,
  }))
  const [termIdx, setTermIdx] = useState(0)
  const draggingRef = useRef(false)
  const dragOffset  = useRef({ x: 0, y: 0 })

  const entry   = glossary[termIdx]
  const isFirst = termIdx === 0
  const isLast  = termIdx === glossary.length - 1

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    const onUp = () => { draggingRef.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = (e: React.MouseEvent) => {
    draggingRef.current = true
    dragOffset.current  = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }

  return (
    <div className="tw" style={{ left: pos.x, top: pos.y }}>
      {/* Titlebar */}
      <div className="tw__titlebar" onMouseDown={startDrag}>
        <div className="ct__dots">
          <span className="ct__dot ct__dot--red" title="Close" style={{ cursor: 'pointer' }} onClick={onClose} />
          <span className="ct__dot ct__dot--yellow" />
          <span className="ct__dot ct__dot--green" />
        </div>
        <span className="tw__path">designer@void — ~/terms-encounter</span>
        <div className="tw__nav">
          <button
            className={`tw__nav-btn${isFirst ? ' tw__nav-btn--dim' : ''}`}
            onClick={() => setTermIdx(i => i - 1)}
          >‹</button>
          <span className="tw__nav-count">{termIdx + 1} / {glossary.length}</span>
          <button
            className={`tw__nav-btn${isLast ? ' tw__nav-btn--dim' : ''}`}
            onClick={() => setTermIdx(i => i + 1)}
          >›</button>
        </div>
      </div>

      {/* Single-term body */}
      <div className={`tw__body${(entry.isCommand || entry.fullWidth) ? ' tw__body--full' : ''}`} key={termIdx}>
        <div className="tw__left">
          <div className="tw__entry-head">
            {entry.isCommand && <span className="tw__dollar">$</span>}
            <span className="tw__term">{entry.term}</span>
          </div>
          <div className="tw__def">{entry.def}</div>
        </div>
        {!entry.isCommand && !entry.fullWidth && (
          <div className="tw__right">
            {entry.image
              ? <img className="tw__img" src={entry.image} alt={entry.term} />
              : <div className="tw__svg-wrap">{entry.svg}</div>
            }
            <div className="tw__analogy">{entry.analogy}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const shortcuts = [
  { action: 'Clear the screen', how: 'clear' },
  { action: 'Cycle through previous commands', how: '↑ / ↓ arrow keys' },
  { action: 'Auto-complete', how: 'Tab' },
  { action: 'Abort a command', how: 'Ctrl + C' },
  { action: 'Jump to start of line', how: 'Ctrl + A' },
  { action: 'Jump to end of line', how: 'Ctrl + E' },
]

const navCommands = [
  { cmd: 'pwd', desc: 'Print working directory — where am I?' },
  { cmd: 'cd <folder-name>', desc: 'Move into a folder' },
  { cmd: 'cd ..', desc: 'Go up one level' },
  { cmd: 'cd ~', desc: 'Go to home folder from anywhere' },
  { cmd: 'ls', desc: 'List files in current folder' },
]

const createCommands = [
  { cmd: 'mkdir <folder-name>', desc: 'Make a new folder' },
  { cmd: 'touch <filename>.txt', desc: 'Create a new empty file' },
]

const readCommands = [
  { cmd: 'cat <filename>', desc: 'Print file contents to terminal' },
  { cmd: 'open <filename>', desc: 'Open file in default app (macOS)' },
  { cmd: 'open .', desc: 'Open current folder in Finder' },
]

const deleteCommands = [
  { cmd: 'rm <filename>', desc: 'Delete a file' },
  { cmd: 'rm -rf <folder-name>', desc: 'Delete a folder and everything inside it' },
]

// ── Exercise 1 ───────────────────────────────────────────────────

const EX_COMMANDS_ESSENTIAL = [
  { cmd: 'mkdir <folder-name>',   desc: 'create a folder' },
  { cmd: 'cd <folder-name>',      desc: 'move into a folder' },
  { cmd: 'touch <filename>',      desc: 'create a file' },
  { cmd: 'open <filename>',       desc: 'open it in your editor' },
  { cmd: '⌘S',                   desc: 'save the file' },
  { cmd: 'ls',                    desc: 'check what\'s inside' },
  { cmd: 'cd ..',                 desc: 'go back up one level' },
]

const EX_COMMANDS_FASTER = [
  { cmd: 'cd components/button', desc: 'jump straight to a deeper level' },
  { cmd: 'cd ../..',             desc: 'go back up multiple levels at once' },
  { cmd: 'cd ~',                 desc: 'go back up home' },
]

const EX_COMMANDS_DELETE = [
  { cmd: 'cd design-system', desc: 'navigate into the folder first' },
  { cmd: 'rm index.ts',      desc: 'delete the index file' },
]

function ExerciseSection() {
  return (
    <section className="lp-section lp-section--last" id="working-session">
      <div className="lp-ex-inner">
      <div className="lp-section-header">
        <span className="lp-section-icon">
          <svg width="56" height="44" viewBox="0 0 56 44" fill="none" aria-hidden="true">
            {/* terminal window frame */}
            <rect x="1" y="1" width="54" height="42" rx="7" stroke="currentColor" strokeWidth="2" opacity="0.35"/>
            {/* title bar divider */}
            <line x1="1" y1="13" x2="55" y2="13" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
            {/* traffic dots */}
            <circle cx="10" cy="7" r="2.5" fill="currentColor" opacity="0.4"/>
            <circle cx="19" cy="7" r="2.5" fill="currentColor" opacity="0.28"/>
            <circle cx="28" cy="7" r="2.5" fill="currentColor" opacity="0.18"/>
            {/* prompt chevron */}
            <path d="M10 26L18 21L10 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* cursor */}
            <rect x="23" y="16" width="10" height="10" rx="1.5" fill="currentColor" opacity="0.55"/>
          </svg>
        </span>
        <div className="lp-section-titles">
          <h2 className="lp-section-title">Working Session</h2>
          <p className="lp-section-sub">Getting Comfortable with Navigation + CRUD</p>
        </div>
      </div>

      <div className="lp-before-start">
        <p className="lp-before-start-heading">👉 Before you start</p>
        <p className="lp-before-start-body">Ensure that you are inside the Documents folder. If you're not sure where you are, run <Code>cd ~</Code> to go home, then <Code>cd Documents</Code>.</p>
      </div>

      {/* ── 1A ── */}
      <div className="lp-sub-exercise lp-sub-exercise--first">
        <div className="lp-sub-exercise-header">
          <span className="lp-sub-label">1A</span>
          <p className="lp-ex-instruction">
            Recreate the folder structure below. When you are creating files, open them and add a random line of text inside.
          </p>
        </div>

        <div className="lp-exercise-body">
          <img src="/tree-1a.png" alt="1A file tree" className="lp-ex-tree-img" />
          <div className="lp-ex-breakdown">
            <div className="lp-ex-breakdown-group">
              <span className="lp-ex-breakdown-label">3 folders</span>
              <ul className="lp-ex-breakdown-list">
                <li>design-system</li>
                <li>components</li>
                <li>button</li>
              </ul>
            </div>
            <div className="lp-ex-breakdown-group">
              <span className="lp-ex-breakdown-label">2 files</span>
              <ul className="lp-ex-breakdown-list">
                <li>button.tsx</li>
                <li>index.ts</li>
              </ul>
            </div>
          </div>
          <div className="lp-exercise-cmds">
            <p className="lp-exercise-cmds-label">Commands you'll need</p>
            <div className="lp-exercise-cmds-group">
              {EX_COMMANDS_ESSENTIAL.map(({ cmd, desc }) => (
                <div key={cmd} className="lp-exercise-cmd-row">
                  <span className="lp-exercise-cmd-desc">{desc}</span>
                  <div className="lp-cmd-row__actions">
                    <code className="lp-code">{cmd}</code>
                    <CopyButton text={cmd} />
                  </div>
                </div>
              ))}
            </div>
            <p className="lp-exercise-cmds-label lp-exercise-cmds-label--faster">Commands to go faster</p>
            <div className="lp-exercise-cmds-group">
              {EX_COMMANDS_FASTER.map(({ cmd, desc }) => (
                <div key={cmd} className="lp-exercise-cmd-row">
                  <span className="lp-exercise-cmd-desc">{desc}</span>
                  <div className="lp-cmd-row__actions">
                    <code className="lp-code">{cmd}</code>
                    <CopyButton text={cmd} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ── 1B ── */}
      <div className="lp-sub-exercise">
        <div className="lp-sub-exercise-header">
          <span className="lp-sub-label">1B</span>
          <p className="lp-ex-instruction">
            In the repository you built in 1A, add one new component alongside the existing ones — a folder and the file that runs it.
          </p>
        </div>

        <div className="lp-exercise-body">
          <img src="/tree-1b.png" alt="1B file tree" className="lp-ex-tree-img" />
          <div className="lp-ex-breakdown">
            <div className="lp-ex-breakdown-group">
              <span className="lp-ex-breakdown-label">1 new folder</span>
              <ul className="lp-ex-breakdown-list">
                <li>card</li>
              </ul>
            </div>
            <div className="lp-ex-breakdown-group">
              <span className="lp-ex-breakdown-label">1 new file</span>
              <ul className="lp-ex-breakdown-list">
                <li>card.tsx</li>
              </ul>
            </div>
          </div>
          <div className="lp-exercise-cmds">
            <p className="lp-exercise-cmds-label">Commands you'll need</p>
            <div className="lp-exercise-cmds-group">
              {EX_COMMANDS_ESSENTIAL.map(({ cmd, desc }) => (
                <div key={cmd} className="lp-exercise-cmd-row">
                  <span className="lp-exercise-cmd-desc">{desc}</span>
                  <div className="lp-cmd-row__actions">
                    <code className="lp-code">{cmd}</code>
                    <CopyButton text={cmd} />
                  </div>
                </div>
              ))}
            </div>
            <p className="lp-exercise-cmds-label lp-exercise-cmds-label--faster">Commands to go faster</p>
            <div className="lp-exercise-cmds-group">
              {EX_COMMANDS_FASTER.map(({ cmd, desc }) => (
                <div key={cmd} className="lp-exercise-cmd-row">
                  <span className="lp-exercise-cmd-desc">{desc}</span>
                  <div className="lp-cmd-row__actions">
                    <code className="lp-code">{cmd}</code>
                    <CopyButton text={cmd} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ── 1C ── */}
      <div className="lp-sub-exercise">
        <div className="lp-sub-exercise-header">
          <span className="lp-sub-label">1C</span>
          <p className="lp-ex-instruction">
            Navigate into the design-system folder and delete the index file inside it.
          </p>
        </div>

        <div className="lp-callout lp-callout--danger">
          <p className="lp-callout-heading">This is permanent</p>
          <p><Code>rm</Code> commands have no undo and no Trash.</p>
        </div>

        <div className="lp-exercise-body">
          <img src="/deleteimage.png" alt="1C — delete file" className="lp-ex-tree-img" />
          <div className="lp-exercise-cmds">
            <p className="lp-exercise-cmds-label">Commands you'll need</p>
            <div className="lp-exercise-cmds-group">
              {EX_COMMANDS_DELETE.map(({ cmd, desc }) => (
                <div key={cmd} className="lp-exercise-cmd-row">
                  <span className="lp-exercise-cmd-desc">{desc}</span>
                  <div className="lp-cmd-row__actions">
                    <code className="lp-code">{cmd}</code>
                    <CopyButton text={cmd} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>{/* lp-ex-inner */}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="lp-scroll">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <p className="lp-hero-eyebrow"><span className="lp-hero-eyebrow-icon">👾</span></p>
          <h1 className="lp-title">
            <span className="lp-title-line1">Terminal</span>
            <span className="lp-title-line2">for Designers</span>
          </h1>
          <p className="lp-subtitle">Stop waiting for a developer to run things for you.</p>
          <a href="#working-session" className="lp-cta-btn">Jump to working session <span className="lp-cta-arrow">→</span></a>
        </div>
        <div className="lp-hero-visual" aria-hidden="true">
          <svg viewBox="0 0 560 440" fill="none" className="lp-hero-terminal">
            {/* opaque background — blocks glow from bleeding through */}
            <rect x="4" y="4" width="552" height="432" rx="28" fill="#111720"/>
            {/* window frame */}
            <rect x="4" y="4" width="552" height="432" rx="28" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
            {/* title bar */}
            <line x1="4" y1="64" x2="556" y2="64" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
            {/* traffic dots */}
            <circle cx="44" cy="36" r="10" fill="currentColor" opacity="0.45"/>
            <circle cx="78" cy="36" r="10" fill="currentColor" opacity="0.25"/>
            <circle cx="112" cy="36" r="10" fill="currentColor" opacity="0.12"/>
            {/* prompt chevron */}
            <path d="M44 180L88 148L44 116" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
            {/* cursor block — sporadic blink */}
            <rect x="104" y="112" width="44" height="68" rx="6" fill="currentColor" className="lp-hero-cursor"/>
            {/* second line */}
            <line x1="44" y1="240" x2="320" y2="240" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.2"/>
            {/* third line shorter */}
            <line x1="44" y1="290" x2="220" y2="290" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.13"/>
            {/* fourth line */}
            <line x1="44" y1="340" x2="280" y2="340" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.1"/>
          </svg>
        </div>
      </section>

      <main className="lp-main">
        {/* ── 01 Concern Terminal ───────────────────────────────── */}
        <div className="ct-glow-wrap">
          <ConcernTerminal items={concerns} />
        </div>

        {/* ── 03 Terminal Tools: Nav + CRUD ────────────────────── */}
        <section className="lp-section">
          <div className="lp-section-header">
            <div className="lp-section-titles">
              <h2 className="lp-section-title">Terminal Tools — Nav + CRUD</h2>
              <p className="lp-section-sub">Understanding location and basic file operations</p>
            </div>
          </div>

          <div className="lp-callout lp-callout--location">
            <div className="lp-callout-left">
              <strong className="lp-callout-heading">Location is everything.</strong>
              <p>
                The terminal always operates from where you currently are. Every command you run is
                relative to your current location — the same command in a different folder can produce
                a completely different result.
              </p>
            </div>
            <img src="/location.jpg" alt="Terminal location illustration" className="lp-callout-img" />
          </div>

          <div className="lp-cmd-groups">
            <div className="lp-cmd-group">
              <div className="lp-cmd-group-label">Navigate</div>
              {navCommands.map((c, i) => (
                <CommandRow key={i} {...c} />
              ))}
            </div>
            <div className="lp-cmd-group">
              <div className="lp-cmd-group-label">Create</div>
              {createCommands.map((c, i) => (
                <CommandRow key={i} {...c} />
              ))}
            </div>
            <div className="lp-cmd-group">
              <div className="lp-cmd-group-label">Read</div>
              {readCommands.map((c, i) => (
                <CommandRow key={i} {...c} />
              ))}
            </div>
            <div className="lp-cmd-group">
              <div className="lp-cmd-group-label lp-cmd-group-label--danger">Delete</div>
              {deleteCommands.map((c, i) => (
                <CommandRow key={i} {...c} />
              ))}
              <div className="lp-danger-callout">
                <strong>Both of these are permanent.</strong> There is no Trash, no undo. The files are gone
                immediately. Always double check what you are deleting before hitting enter — and never run
                these commands if you are unsure.
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 Moving Around the Terminal ───────────────────── */}
        <section className="lp-section">
          <div className="lp-section-header">
            <div className="lp-section-titles">
              <h2 className="lp-section-title">Moving Around the Terminal</h2>
              <p className="lp-section-sub">Keyboard shortcuts and navigation essentials</p>
            </div>
          </div>

          <div className="lp-shortcuts">
            {shortcuts.map((item, i) => (
              <div className="lp-shortcut-row" key={i}>
                <span className="lp-shortcut-action">{item.action}</span>
                <Code>{item.how}</Code>
              </div>
            ))}
          </div>

          <div className="lp-callout">
            <span className="lp-callout-icon">💡</span>
            <div className="lp-callout-body">
              <p className="lp-callout-heading">Drag a file into the terminal to get its path.</p>
              <p>Instead of typing out a long file path, drag any file or folder from Finder directly into the terminal window — the full path appears automatically, ready to use.</p>
            </div>
          </div>
        </section>

        {/* ── 05 When You're Stuck ─────────────────────────────── */}
        <section className="lp-section">
          <div className="lp-section-header">
            <div className="lp-section-titles">
              <h2 className="lp-section-title">When You're Stuck</h2>
              <p className="lp-section-sub">Debugging steps and common errors</p>
            </div>
          </div>

          <div className="lp-stuck-checks">
            <h3 className="lp-subsection-title">First things to check</h3>
            <ul className="lp-checklist">
              <li>
                Am I in the right folder? → run <Code>pwd</Code>
              </li>
              <li>
                Just installed something and it's not working? → try opening a new terminal session before
                assuming something went wrong
              </li>
              <li>
                Still stuck? → ask an AI tool, share the exact error message, what command you ran and what
                you expected
              </li>
            </ul>
          </div>

          <div>
            <h3 className="lp-subsection-title">Common errors</h3>
            <div className="lp-errors">
              <ErrorCard title="command not found">
                <ul className="lp-error-bullets">
                  <li>The tool is either not installed or not installed properly</li>
                  <li>
                    Run <Code>{'which <tool-name>'}</Code> to diagnose — if nothing comes back, it's not installed
                  </li>
                  <li>
                    Try <Code>toolname --version</Code> — if it returns a version number, the tool is
                    installed correctly
                  </li>
                  <li>If neither works, reinstall the tool and open a new session after</li>
                </ul>
                <div className="lp-aside">
                  <strong>What is a flag?</strong> <Code>--version</Code> is a flag — a way of passing an
                  extra instruction to a command. Most commands have several flags. They always start with{' '}
                  <Code>--</Code>
                </div>
              </ErrorCard>

              <ErrorCard title="Port already in use">
                <ul className="lp-error-bullets">
                  <li>A previous process is still running in the background</li>
                  <li>Easiest fix: restart your terminal session and try again</li>
                </ul>
              </ErrorCard>

              <ErrorCard title="Permission denied">
                <ul className="lp-error-bullets">
                  <li>The file or folder isn't allowing access</li>
                  <li>
                    Usually flagged during installs — read the error carefully, it often tells you exactly
                    what to do
                  </li>
                  <li>
                    Sometimes the fix is prefixing your command with <Code>sudo</Code> — this runs it with
                    admin level access
                  </li>
                </ul>
                <div className="lp-danger-callout">
                  <strong>Be careful with sudo.</strong> It bypasses your computer's normal safety checks.
                  Only use it if you fully understand what the command does — and when in doubt, ask an AI
                  tool to explain the command before running it.
                </div>
              </ErrorCard>
            </div>
          </div>
        </section>

        {/* ── 06 Suggested Curriculum ──────────────────────────── */}
        <section className="lp-section lp-section--wide">
          <div className="lp-section-header">
            <div className="lp-section-titles">
              <h2 className="lp-section-title">Suggested Curriculum</h2>
              <p className="lp-section-sub">A three-phase learning path for designers</p>
            </div>
          </div>
          <div className="lp-phases">
            <div className="lp-phase-card">
              <div className="lp-phase-num">Phase 1</div>
              <div className="lp-phase-title">Terminal Basics</div>
              <ul className="lp-phase-list">
                <li>
                  Navigate your file system
                  <div className="lp-phase-cmds"><Code>pwd</Code><Code>cd</Code><Code>ls</Code></div>
                </li>
                <li>
                  Create and delete files
                  <div className="lp-phase-cmds"><Code>mkdir</Code><Code>touch</Code><Code>rm</Code></div>
                </li>
                <li>
                  Read file contents
                  <div className="lp-phase-cmds"><Code>cat</Code><Code>open</Code></div>
                </li>
                <li>
                  Understand your home folder and how location affects every command
                  <div className="lp-phase-cmds"><Code>~</Code></div>
                </li>
              </ul>
            </div>
            <div className="lp-phase-card">
              <div className="lp-phase-num">Phase 2</div>
              <div className="lp-phase-title">Git Basics</div>
              <ul className="lp-phase-list">
                <li>
                  Initialise a repo
                  <div className="lp-phase-cmds"><Code>git init</Code></div>
                </li>
                <li>
                  Check what's changed
                  <div className="lp-phase-cmds"><Code>git status</Code></div>
                </li>
                <li>
                  Stage and commit
                  <div className="lp-phase-cmds"><Code>git add</Code><Code>git commit</Code></div>
                </li>
                <li>
                  Branches
                  <div className="lp-phase-cmds"><Code>git branch</Code><Code>git checkout</Code></div>
                </li>
                <li>
                  Push and pull
                  <div className="lp-phase-cmds"><Code>git push</Code><Code>git pull</Code></div>
                </li>
              </ul>
            </div>
            <div className="lp-phase-card">
              <div className="lp-phase-num">Phase 3</div>
              <div className="lp-phase-title">Node Basics</div>
              <ul className="lp-phase-list">
                <li>
                  Check if Node is installed
                  <div className="lp-phase-cmds"><Code>node --version</Code></div>
                </li>
                <li>
                  Install dependencies
                  <div className="lp-phase-cmds"><Code>npm install</Code></div>
                </li>
                <li>
                  Start a local dev server
                  <div className="lp-phase-cmds"><Code>npm run dev</Code></div>
                </li>
                <li>
                  Install a tool globally
                  <div className="lp-phase-cmds"><Code>npm install -g</Code></div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <ExerciseSection />
      </main>
    </div>
  )
}
