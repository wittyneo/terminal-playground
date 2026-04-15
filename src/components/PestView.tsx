import { useState, useEffect, useRef, useCallback } from 'react'
import './PestView.css'

// ── Repo tree definition ──────────────────────────────────────────

interface TreeNode {
  name: string
  path: string
  children?: TreeNode[]
}

const REPO_ROOT = 'design-system'

const TREE: TreeNode = {
  name: REPO_ROOT,
  path: '',
  children: [
    {
      name: 'components', path: 'components',
      children: [
        { name: 'Button',  path: 'components/Button'  },
        { name: 'Card',    path: 'components/Card'    },
        { name: 'Modal',   path: 'components/Modal'   },
        { name: 'Input',   path: 'components/Input'   },
        { name: 'Heading', path: 'components/Heading' },
        { name: 'Icon',    path: 'components/Icon'    },
      ],
    },
    {
      name: 'tokens', path: 'tokens',
      children: [
        { name: 'colors',     path: 'tokens/colors'     },
        { name: 'spacing',    path: 'tokens/spacing'    },
        { name: 'typography', path: 'tokens/typography' },
      ],
    },
    {
      name: 'assets', path: 'assets',
      children: [
        { name: 'icons',  path: 'assets/icons'  },
        { name: 'images', path: 'assets/images' },
      ],
    },
    {
      name: 'pages', path: 'pages',
      children: [
        { name: 'Home',     path: 'pages/Home'     },
        { name: 'Settings', path: 'pages/Settings' },
        { name: 'Profile',  path: 'pages/Profile'  },
      ],
    },
  ],
}

const ALL_PATHS = [
  'components',
  'components/Button', 'components/Card', 'components/Modal',
  'components/Input', 'components/Heading', 'components/Icon',
  'tokens',
  'tokens/colors', 'tokens/spacing', 'tokens/typography',
  'assets',
  'assets/icons', 'assets/images',
  'pages',
  'pages/Home', 'pages/Settings', 'pages/Profile',
]

const BUG_ALERTS: Record<string, string> = {
  'components':           'Something in components is misbehaving',
  'components/Button':    'Padding is off — Button feels cramped',
  'components/Card':      'Drop shadow missing — Card looks flat',
  'components/Modal':     'Modal backdrop is the wrong opacity',
  'components/Input':     'Focus ring broken — Input isn\'t accessible',
  'components/Heading':   'Heading font size has regressed',
  'components/Icon':      'Icons are rendering at the wrong size',
  'tokens':               'Token values are out of sync',
  'tokens/colors':        'Brand colour is the wrong hex value',
  'tokens/spacing':       'Spacing scale is misaligned',
  'tokens/typography':    'Font stack fell back to system font',
  'assets':               'An asset file is corrupt',
  'assets/icons':         'SVG stroke weight is inconsistent',
  'assets/images':        'Hero image is the wrong aspect ratio',
  'pages':                'A page layout has collapsed',
  'pages/Home':           'Home page grid has broken',
  'pages/Settings':       'Settings has a z-index war',
  'pages/Profile':        'Profile avatar is rendering square',
}

const TIMER_DURATION = 20
const MAX_MISSES = 3

// ── Navigation helpers ────────────────────────────────────────────

function getNode(path: string): TreeNode | null {
  if (path === '') return TREE
  const parts = path.split('/')
  let node: TreeNode = TREE
  for (const part of parts) {
    const child = node.children?.find(c => c.name === part)
    if (!child) return null
    node = child
  }
  return node
}

function navigatePath(
  currentPath: string,
  cmd: string
): { newPath: string; error?: string } {
  const bare = cmd.replace(/^cd\s*/, '').trim()

  if (!bare || bare === '~') return { newPath: '' }

  if (bare === '..') {
    if (currentPath === '') return { newPath: '' }
    const parts = currentPath.split('/')
    parts.pop()
    return { newPath: parts.join('/') }
  }

  // Relative path (possibly multi-level)
  const newPath = currentPath ? `${currentPath}/${bare}` : bare
  if (!getNode(newPath)) {
    return { newPath: currentPath, error: `cd: no such file or directory: ${bare}` }
  }
  return { newPath }
}

function randomPestPath(exclude?: string): string {
  const options = ALL_PATHS.filter(p => p !== exclude)
  return options[Math.floor(Math.random() * options.length)]
}

// ── Tree map component ────────────────────────────────────────────

function MapNode({
  node,
  currentPath,
  pestPath,
  depth,
}: {
  node: TreeNode
  currentPath: string
  pestPath: string
  depth: number
}) {
  const isHere  = node.path === currentPath
  const isPest  = node.path === pestPath
  const hasCh   = !!node.children?.length

  return (
    <>
      <div
        className={[
          'pv-map-row',
          isHere ? 'pv-map-row--here' : '',
          isPest ? 'pv-map-row--pest' : '',
        ].join(' ')}
        style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
      >
        {hasCh ? (
          <span className="pv-map-folder-icon">
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path
                d="M0.5 2.5C0.5 1.67 1.17 1 2 1H4.5L5.8 2.5H11C11.83 2.5 12.5 3.17 12.5 4V9C12.5 9.83 11.83 10.5 11 10.5H2C1.17 10.5 0.5 9.83 0.5 9V2.5Z"
                fill="currentColor"
              />
            </svg>
          </span>
        ) : (
          <span className="pv-map-leaf-icon">◌</span>
        )}
        <span className="pv-map-name">{node.name}</span>
        {isHere && <span className="pv-map-you">← you</span>}
        {isPest && <span className="pv-map-pest-badge">⚠</span>}
      </div>
      {hasCh && node.children!.map(child => (
        <MapNode
          key={child.path}
          node={child}
          currentPath={currentPath}
          pestPath={pestPath}
          depth={depth + 1}
        />
      ))}
    </>
  )
}

// ── Terminal line types ───────────────────────────────────────────

interface OutputLine {
  type: 'cmd' | 'out' | 'success' | 'error' | 'info'
  text: string
}

// ── Game over screen ──────────────────────────────────────────────

function GameOver({
  score,
  onRetry,
  onExit,
}: {
  score: number
  onRetry: () => void
  onExit: () => void
}) {
  return (
    <div className="pv-gameover">
      <div className="pv-gameover-inner">
        <div className="pv-gameover-eyebrow">repo compromised</div>
        <div className="pv-gameover-score">{score}</div>
        <div className="pv-gameover-label">pests caught</div>
        <p className="pv-gameover-sub">
          3 bugs escaped. The design system is a mess.
        </p>
        <div className="pv-gameover-actions">
          <button className="pv-gameover-btn pv-gameover-btn--retry" onClick={onRetry}>
            Try again
          </button>
          <button className="pv-gameover-btn" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────

type GamePhase = 'playing' | 'caught' | 'escaped' | 'gameover'

export function PestView({ onExit }: { onExit: () => void }) {
  const [currentPath, setCurrentPath] = useState('')
  const [pestPath, setPestPath]       = useState(() => randomPestPath())
  const [timer, setTimer]             = useState(TIMER_DURATION)
  const [score, setScore]             = useState(0)
  const [misses, setMisses]           = useState(0)
  const [phase, setPhase]             = useState<GamePhase>('playing')
  const [inputValue, setInputValue]   = useState('')
  const [output, setOutput]           = useState<OutputLine[]>([])
  const [catchFlash, setCatchFlash]   = useState(false)
  const [escapeFlash, setEscapeFlash] = useState(false)

  const inputRef  = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const addOutput = useCallback((lines: OutputLine[]) => {
    setOutput(prev => [...prev, ...lines])
  }, [])

  // Scroll terminal to bottom
  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  // Timer — starts/stops with phase, does NOT reset timer (reset happens at round transitions)
  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(id); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, pestPath])

  // React to timer hitting zero
  useEffect(() => {
    if (timer !== 0 || phase !== 'playing') return

    const newMisses = misses + 1
    setMisses(newMisses)
    setPhase('escaped')
    setEscapeFlash(true)
    addOutput([{ type: 'error', text: `⚠ Pest escaped from ${pestPath ? REPO_ROOT + '/' + pestPath : REPO_ROOT}!` }])

    if (newMisses >= MAX_MISSES) {
      setTimeout(() => setPhase('gameover'), 1400)
    } else {
      setTimeout(() => {
        const next = randomPestPath(pestPath)
        setPestPath(next)
        setTimer(TIMER_DURATION)
        setEscapeFlash(false)
        setPhase('playing')
        addOutput([{ type: 'info', text: `New report: ${BUG_ALERTS[next]}` }])
      }, 1600)
    }
  }, [timer, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    const cmd = inputValue.trim()
    if (!cmd) return
    setInputValue('')

    const promptPath = currentPath
      ? `${REPO_ROOT}/${currentPath}`
      : REPO_ROOT
    addOutput([{ type: 'cmd', text: `${promptPath} $ ${cmd}` }])

    if (phase !== 'playing') {
      addOutput([{ type: 'error', text: 'Waiting for next pest...' }])
      return
    }

    if (cmd === 'ls') {
      const node = getNode(currentPath)
      const children = node?.children?.map(c => c.name).join('   ') || '(empty)'
      addOutput([{ type: 'out', text: children }])

      if (currentPath === pestPath) {
        // Caught!
        setCatchFlash(true)
        setScore(s => s + 1)
        setPhase('caught')
        addOutput([{ type: 'success', text: `✓ Caught! "${BUG_ALERTS[pestPath]}" — fixed.` }])
        setTimeout(() => {
          const next = randomPestPath(pestPath)
          setPestPath(next)
          setTimer(TIMER_DURATION)
          setCatchFlash(false)
          setPhase('playing')
          addOutput([{ type: 'info', text: `New report: ${BUG_ALERTS[next]}` }])
        }, 1800)
      }

    } else if (cmd.startsWith('cd')) {
      const { newPath, error } = navigatePath(currentPath, cmd)
      if (error) {
        addOutput([{ type: 'error', text: error }])
      } else {
        setCurrentPath(newPath)
      }

    } else if (cmd === 'pwd') {
      addOutput([{
        type: 'out',
        text: `~/${REPO_ROOT}${currentPath ? '/' + currentPath : ''}`,
      }])

    } else {
      addOutput([{ type: 'error', text: `${cmd}: command not found` }])
    }
  }

  const timerPct   = (timer / TIMER_DURATION) * 100
  const timerColor = timer > 12 ? 'var(--cyan)' : timer > 6 ? '#ffbd2e' : 'var(--danger)'

  if (phase === 'gameover') {
    return (
      <GameOver
        score={score}
        onRetry={() => {
          setCurrentPath('')
          setPestPath(randomPestPath())
          setTimer(TIMER_DURATION)
          setScore(0)
          setMisses(0)
          setOutput([])
          setCatchFlash(false)
          setEscapeFlash(false)
          setPhase('playing')
        }}
        onExit={onExit}
      />
    )
  }

  const livesLeft = MAX_MISSES - misses

  return (
    <div className="pv-layout">

      {/* ── Alert bar ───────────────────────────────────────── */}
      <div className={[
        'pv-alert',
        catchFlash  ? 'pv-alert--catch'  : '',
        escapeFlash ? 'pv-alert--escape' : '',
      ].join(' ')}>
        <div className="pv-alert-left">
          <span className="pv-alert-icon">⚠</span>
          <span className="pv-alert-text">{BUG_ALERTS[pestPath]}</span>
          <span className="pv-alert-hint">— navigate there and run <code>ls</code></span>
        </div>
        <div className="pv-alert-right">
          <div className="pv-lives">
            {Array.from({ length: MAX_MISSES }).map((_, i) => (
              <span key={i} className={`pv-life ${i < livesLeft ? 'pv-life--on' : 'pv-life--off'}`}>●</span>
            ))}
          </div>
          <span className="pv-score-badge">{score} caught</span>
          <button className="pv-exit-btn" onClick={onExit}>Exit</button>
        </div>
      </div>

      {/* ── Timer strip ─────────────────────────────────────── */}
      <div className="pv-timer-track">
        <div
          className="pv-timer-fill"
          style={{
            width: `${timerPct}%`,
            background: timerColor,
            transition: 'width 1s linear, background 0.4s ease',
          }}
        />
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="pv-body">

        {/* File tree map */}
        <div className="pv-map">
          <div className="pv-map-header">
            <span className="pv-map-header-label">EXPLORER</span>
            <span className="pv-map-header-project">design-system</span>
          </div>
          <div className="pv-map-tree">
            <MapNode
              node={TREE}
              currentPath={currentPath}
              pestPath={pestPath}
              depth={0}
            />
          </div>
          <div className="pv-legend">
            <span className="pv-legend-you">■ your location</span>
            <span className="pv-legend-pest">⚠ bug report</span>
          </div>
        </div>

        {/* Terminal */}
        <div
          className="pv-terminal"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="pv-term-titlebar">
            <div className="pv-term-dots">
              <span className="pv-dot pv-dot--r" />
              <span className="pv-dot pv-dot--y" />
              <span className="pv-dot pv-dot--g" />
            </div>
            <span className="pv-term-title">
              {REPO_ROOT}{currentPath ? `/${currentPath}` : ''}
            </span>
          </div>

          <div className="pv-term-output" ref={outputRef}>
            <div className="pv-term-welcome">
              Use <code>cd foldername</code>, <code>cd ..</code>, <code>cd ~</code> to navigate.
              Run <code>ls</code> when you think you've found the pest.
            </div>
            {output.map((line, i) => (
              <div key={i} className={`pv-term-line pv-term-line--${line.type}`}>
                {line.text}
              </div>
            ))}
          </div>

          <div className="pv-term-input-wrap">
            <span className="pv-term-ps1">
              <span className="pv-ps1-root">{REPO_ROOT}</span>
              {currentPath && <span className="pv-ps1-sub">/{currentPath}</span>}
              <span className="pv-ps1-dollar"> $</span>
            </span>
            <input
              ref={inputRef}
              className="pv-term-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              placeholder="type a command…"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
