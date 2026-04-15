import { useState, useEffect } from 'react'
import { FS, pathsEqual, type FsNode } from '../data/hunts'
import './HuntFileTree.css'

interface Props {
  currentPath: string[]
  targetDir: string[]
  targetFile: string
}

function fileIcon(name: string): { glyph: string; cls: string } {
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return { glyph: '⬡', cls: 'icon--tsx' }
  if (name.endsWith('.ts'))   return { glyph: '◈', cls: 'icon--ts'   }
  if (name.endsWith('.js'))   return { glyph: '◈', cls: 'icon--js'   }
  if (name.endsWith('.json')) return { glyph: '◉', cls: 'icon--json' }
  if (name.endsWith('.md'))   return { glyph: '◎', cls: 'icon--md'   }
  if (name.startsWith('.'))   return { glyph: '·', cls: 'icon--dot'  }
  return { glyph: '◌', cls: '' }
}

// Build the full path of a node given its ancestor path
function nodePath(parentPath: string[], name: string): string[] {
  return [...parentPath, name]
}

// Collect all ancestor ids of a given path for auto-expansion
function ancestorIds(path: string[]): string[] {
  const ids: string[] = []
  for (let i = 1; i <= path.length; i++) {
    ids.push(path.slice(0, i).join('/'))
  }
  return ids
}

// ── Node component ──────────────────────────────────────────

interface NodeProps {
  node: FsNode
  path: string[]       // full path to this node
  isLast: boolean
  currentPath: string[]
  targetDir: string[]
  targetFile: string
  expanded: Set<string>
  onToggle: (id: string) => void
}

function Node({ node, path, isLast, currentPath, targetDir, targetFile, expanded, onToggle }: NodeProps) {
  const id         = path.join('/')
  const isExpanded = node.type === 'dir' && expanded.has(id)
  const hasChildren = node.type === 'dir' && (node.children?.length ?? 0) > 0

  const isCurrent  = node.type === 'dir' && pathsEqual(path, currentPath)
  const isTargetDir = node.type === 'dir' && pathsEqual(path, targetDir)
  const isTargetFile = node.type === 'file' && node.name === targetFile && pathsEqual(path.slice(0, -1), targetDir)

  if (node.type === 'file') {
    const { glyph, cls } = fileIcon(node.name)
    return (
      <li className={`hft-item ${isLast ? 'hft-item--last' : ''}`}>
        <div className={`hft-row ${isTargetFile ? 'hft-row--target-file' : ''}`}>
          <span className={`hft-file-glyph ${cls}`}>{glyph}</span>
          <span className={`hft-label hft-label--file ${cls} ${isTargetFile ? 'hft-label--target' : ''}`}>
            {node.name}
          </span>
          {isTargetFile && <span className="hft-target-badge">TARGET</span>}
        </div>
      </li>
    )
  }

  return (
    <li className={`hft-item ${isLast ? 'hft-item--last' : ''}`}>
      <div
        className={[
          'hft-row',
          'hft-row--folder',
          isCurrent    ? 'hft-row--current'    : '',
          isTargetDir  ? 'hft-row--target-dir' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => hasChildren && onToggle(id)}
        role={hasChildren ? 'button' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <span className={`hft-chevron ${isExpanded ? 'hft-chevron--open' : ''}`}>
          {hasChildren ? '›' : ' '}
        </span>
        <span className="hft-folder-icon">
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
            <path
              d="M0.5 2.5C0.5 1.67 1.17 1 2 1H4.5L5.8 2.5H11C11.83 2.5 12.5 3.17 12.5 4V9C12.5 9.83 11.83 10.5 11 10.5H2C1.17 10.5 0.5 9.83 0.5 9V2.5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className={`hft-label hft-label--folder`}>{node.name}</span>
        {isCurrent   && <span className="hft-current-badge">you</span>}
      </div>

      {isExpanded && hasChildren && (
        <ul className="hft-list">
          {node.children!.map((child, i) => (
            <Node
              key={child.name}
              node={child}
              path={nodePath(path, child.name)}
              isLast={i === node.children!.length - 1}
              currentPath={currentPath}
              targetDir={targetDir}
              targetFile={targetFile}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// ── Root component ──────────────────────────────────────────

export function HuntFileTree({ currentPath, targetDir, targetFile }: Props) {
  // Auto-expand ancestors of both currentPath and targetDir
  const initialExpanded = new Set<string>([
    ...ancestorIds(currentPath),
    ...ancestorIds(targetDir),
  ])

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded)

  // Re-expand when currentPath changes (user navigates)
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev)
      ancestorIds(currentPath).forEach((id) => next.add(id))
      return next
    })
  }, [currentPath.join('/')])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rootId        = '~'
  const rootExpanded  = expanded.has(rootId)
  const rootIsCurrent = pathsEqual(['~'], currentPath)

  return (
    <div className="hft">
      <div className="hft__header">
        <span className="hft__icon">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="0.5" y="0.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.7"/>
            <rect x="6.5" y="0.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4"/>
            <rect x="0.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4"/>
            <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.7"/>
          </svg>
        </span>
        <span className="hft__label">EXPLORER</span>
        <span className="hft__project">~/Projects</span>
      </div>

      <div className="hft__body">
        {/* Root ~ row */}
        <div
          className={`hft-row hft-row--folder hft-row--root ${rootIsCurrent ? 'hft-row--current' : ''}`}
          onClick={() => toggle(rootId)}
          role="button"
          aria-expanded={rootExpanded}
        >
          <span className={`hft-chevron ${rootExpanded ? 'hft-chevron--open' : ''}`}>›</span>
          <span className="hft-folder-icon">
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path
                d="M0.5 2.5C0.5 1.67 1.17 1 2 1H4.5L5.8 2.5H11C11.83 2.5 12.5 3.17 12.5 4V9C12.5 9.83 11.83 10.5 11 10.5H2C1.17 10.5 0.5 9.83 0.5 9V2.5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="hft-label hft-label--folder">~</span>
          {rootIsCurrent && <span className="hft-current-badge">you</span>}
        </div>

        {rootExpanded && FS.children && (
          <ul className="hft-list hft-list--root">
            {FS.children.map((child, i) => (
              <Node
                key={child.name}
                node={child}
                path={['~', child.name]}
                isLast={i === FS.children!.length - 1}
                currentPath={currentPath}
                targetDir={targetDir}
                targetFile={targetFile}
                expanded={expanded}
                onToggle={toggle}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
