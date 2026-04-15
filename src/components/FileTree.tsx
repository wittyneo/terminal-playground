import { useState, useEffect } from 'react'
import type { Category } from '../data/lessons'
import './FileTree.css'

interface TreeNode {
  name: string
  type: 'file' | 'folder'
  id: string              // unique path key for expand tracking
  activePath?: string     // which lesson prompt maps to this node
  children?: TreeNode[]
  dim?: boolean
}

const TREE: TreeNode = {
  name: 'design-system',
  type: 'folder',
  id: 'design-system',
  activePath: '~/Projects/design-system',
  children: [
    {
      name: 'components',
      type: 'folder',
      id: 'design-system/components',
      activePath: '~/Projects/design-system/components',
      children: [
        {
          name: 'Button',
          type: 'folder',
          id: 'design-system/components/Button',
          children: [
            { name: 'Button.tsx', type: 'file', id: '' },
            { name: 'index.ts',   type: 'file', id: '' },
          ],
        },
        {
          name: 'Card',
          type: 'folder',
          id: 'design-system/components/Card',
          children: [
            { name: 'Card.tsx', type: 'file', id: '' },
            { name: 'index.ts', type: 'file', id: '' },
          ],
        },
        {
          name: 'Modal',
          type: 'folder',
          id: 'design-system/components/Modal',
          children: [
            { name: 'Modal.tsx', type: 'file', id: '' },
            { name: 'index.ts',  type: 'file', id: '' },
          ],
        },
        { name: 'index.ts', type: 'file', id: '' },
      ],
    },
    {
      name: 'hooks',
      type: 'folder',
      id: 'design-system/hooks',
      children: [
        { name: 'useTheme.ts',  type: 'file', id: '' },
        { name: 'useTokens.ts', type: 'file', id: '' },
      ],
    },
    {
      name: 'assets',
      type: 'folder',
      id: 'design-system/assets',
      children: [
        { name: 'icons', type: 'folder', id: 'design-system/assets/icons', children: [] },
        { name: 'fonts', type: 'folder', id: 'design-system/assets/fonts', children: [] },
      ],
    },
    {
      name: 'node_modules',
      type: 'folder',
      id: 'design-system/node_modules',
      dim: true,
      children: [],
    },
    { name: '.gitignore',    type: 'file', id: '' },
    { name: 'package.json',  type: 'file', id: '' },
    { name: 'README.md',     type: 'file', id: '' },
    { name: 'tsconfig.json', type: 'file', id: '' },
  ],
}

function fileIcon(name: string) {
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return { glyph: '⬡', cls: 'icon--tsx' }
  if (name.endsWith('.ts'))    return { glyph: '◈', cls: 'icon--ts'   }
  if (name.endsWith('.js'))    return { glyph: '◈', cls: 'icon--js'   }
  if (name.endsWith('.json'))  return { glyph: '◉', cls: 'icon--json' }
  if (name.endsWith('.md'))    return { glyph: '◎', cls: 'icon--md'   }
  if (name.startsWith('.'))    return { glyph: '·', cls: 'icon--dot'  }
  return { glyph: '◌', cls: '' }
}

function promptToId(prompt: string): string {
  const map: Record<string, string> = {
    '~/Projects/design-system':            'design-system',
    '~/Projects/design-system/components': 'design-system/components',
  }
  return map[prompt] ?? 'design-system'
}

// ── Node component ──────────────────────────────────────────

interface NodeProps {
  node: TreeNode
  isLast: boolean
  activeId: string
  expanded: Set<string>
  onToggle: (id: string) => void
  isNavigation: boolean
}

function Node({ node, isLast, activeId, expanded, onToggle, isNavigation }: NodeProps) {
  const isActive   = isNavigation && node.activePath !== undefined && node.id !== '' && node.activePath === PROMPT_MAP[activeId]
  const isExpanded = node.type === 'folder' && expanded.has(node.id)
  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0

  if (node.type === 'file') {
    const { glyph, cls } = fileIcon(node.name)
    return (
      <li className={`tree-item ${isLast ? 'tree-item--last' : ''}`}>
        <div className="tree-row">
          <span className={`tree-file-glyph ${cls}`}>{glyph}</span>
          <span className={`tree-label tree-label--file ${cls}`}>{node.name}</span>
        </div>
      </li>
    )
  }

  return (
    <li className={`tree-item ${isLast ? 'tree-item--last' : ''}`}>
      <div
        className={`tree-row tree-row--folder ${isActive ? 'tree-row--active' : ''} ${node.dim ? 'tree-row--dim' : ''}`}
        onClick={() => hasChildren && onToggle(node.id)}
        role={hasChildren ? 'button' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <span className={`tree-chevron ${isExpanded ? 'tree-chevron--open' : ''}`}>
          {hasChildren ? '›' : ' '}
        </span>
        <span className="tree-folder-icon">
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
            <path d="M0.5 2.5C0.5 1.67 1.17 1 2 1H4.5L5.8 2.5H11C11.83 2.5 12.5 3.17 12.5 4V9C12.5 9.83 11.83 10.5 11 10.5H2C1.17 10.5 0.5 9.83 0.5 9V2.5Z" fill="currentColor"/>
          </svg>
        </span>
        <span className="tree-label tree-label--folder">{node.name}</span>
        {node.dim && <span className="tree-dim">···</span>}
      </div>

      {isExpanded && hasChildren && (
        <ul className="tree-list">
          {node.children!.map((child, i) => (
            <Node
              key={child.name}
              node={child}
              isLast={i === node.children!.length - 1}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              isNavigation={isNavigation}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// Map activeId back to prompt for isActive check (reverse lookup)
const PROMPT_MAP: Record<string, string> = {
  'design-system':            '~/Projects/design-system',
  'design-system/components': '~/Projects/design-system/components',
}

// ── Root component ──────────────────────────────────────────

interface Props {
  currentPrompt: string
  category: Category
}

const DEFAULT_EXPANDED = new Set([
  'design-system',
  'design-system/components',
])

export function FileTree({ currentPrompt, category }: Props) {
  const isNavigation = category === 'NAVIGATION'
  const activeId = promptToId(currentPrompt)

  const [expanded, setExpanded] = useState<Set<string>>(DEFAULT_EXPANDED)

  // Auto-expand ancestors of the active path when it changes
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev)
      const parts = activeId.split('/')
      let acc = ''
      for (const part of parts) {
        acc = acc ? `${acc}/${part}` : part
        next.add(acc)
      }
      return next
    })
  }, [activeId])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={`file-tree ${!isNavigation ? 'file-tree--dim' : ''}`}>
      <div className="file-tree__header">
        <span className="file-tree__icon">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="0.5" y="0.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.7"/>
            <rect x="6.5" y="0.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4"/>
            <rect x="0.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.4"/>
            <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.7"/>
          </svg>
        </span>
        <span className="file-tree__label">EXPLORER</span>
        <span className="file-tree__project">design-system</span>
      </div>

      <div className="file-tree__body">
        {/* Root folder row — always shown, not in a list */}
        <div
          className={`tree-row tree-row--folder tree-row--root ${isNavigation && activeId === 'design-system' ? 'tree-row--active' : ''}`}
          onClick={() => toggle(TREE.id)}
          role="button"
          aria-expanded={expanded.has(TREE.id)}
        >
          <span className={`tree-chevron ${expanded.has(TREE.id) ? 'tree-chevron--open' : ''}`}>›</span>
          <span className="tree-folder-icon">
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path d="M0.5 2.5C0.5 1.67 1.17 1 2 1H4.5L5.8 2.5H11C11.83 2.5 12.5 3.17 12.5 4V9C12.5 9.83 11.83 10.5 11 10.5H2C1.17 10.5 0.5 9.83 0.5 9V2.5Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="tree-label tree-label--folder">{TREE.name}</span>
        </div>

        {/* Children */}
        {expanded.has(TREE.id) && TREE.children && (
          <ul className="tree-list tree-list--root">
            {TREE.children.map((child, i) => (
              <Node
                key={child.name}
                node={child}
                isLast={i === TREE.children!.length - 1}
                activeId={activeId}
                expanded={expanded}
                onToggle={toggle}
                isNavigation={isNavigation}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
