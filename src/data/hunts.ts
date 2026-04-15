// ── Virtual Filesystem ────────────────────────────────────────

export interface FsNode {
  name: string
  type: 'file' | 'dir'
  children?: FsNode[]
}

export const FS: FsNode = {
  name: '~',
  type: 'dir',
  children: [
    {
      name: 'Projects',
      type: 'dir',
      children: [
        {
          name: 'design-system',
          type: 'dir',
          children: [
            {
              name: 'src',
              type: 'dir',
              children: [
                {
                  name: 'components',
                  type: 'dir',
                  children: [
                    {
                      name: 'Button',
                      type: 'dir',
                      children: [
                        { name: 'Button.tsx', type: 'file' },
                        { name: 'index.ts',   type: 'file' },
                      ],
                    },
                    {
                      name: 'Card',
                      type: 'dir',
                      children: [
                        { name: 'Card.tsx', type: 'file' },
                        { name: 'index.ts', type: 'file' },
                      ],
                    },
                    {
                      name: 'Modal',
                      type: 'dir',
                      children: [
                        { name: 'Modal.tsx', type: 'file' },
                        { name: 'index.ts',  type: 'file' },
                      ],
                    },
                    { name: 'index.ts', type: 'file' },
                  ],
                },
                {
                  name: 'hooks',
                  type: 'dir',
                  children: [
                    { name: 'useTheme.ts',  type: 'file' },
                    { name: 'useTokens.ts', type: 'file' },
                  ],
                },
                {
                  name: 'utils',
                  type: 'dir',
                  children: [
                    { name: 'formatters.ts',  type: 'file' },
                    { name: 'classnames.ts',  type: 'file' },
                  ],
                },
              ],
            },
            {
              name: 'docs',
              type: 'dir',
              children: [
                { name: 'getting-started.md', type: 'file' },
                { name: 'contributing.md',    type: 'file' },
              ],
            },
            { name: 'package.json',  type: 'file' },
            { name: 'tsconfig.json', type: 'file' },
            { name: 'README.md',     type: 'file' },
          ],
        },
        {
          name: 'archive',
          type: 'dir',
          children: [
            {
              name: 'old-components',
              type: 'dir',
              children: [
                { name: 'LegacyButton.tsx', type: 'file' },
                { name: 'OldModal.tsx',     type: 'file' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ── Hunt Definitions ──────────────────────────────────────────

export interface Hunt {
  id: number
  title: string
  brief: string
  startPath: string[]
  targetDir: string[]
  targetFile: string
  successMessage: string
}

export const hunts: Hunt[] = [
  {
    id: 1,
    title: 'The Broken Button',
    brief:
      "A designer pushed a commit and now the primary button is completely unstyled. The component lives somewhere inside the design system source. Navigate there and find Button.tsx.",
    startPath: ['~'],
    targetDir: ['~', 'Projects', 'design-system', 'src', 'components', 'Button'],
    targetFile: 'Button.tsx',
    successMessage: 'Found it. Button.tsx — right there in the void.',
  },
  {
    id: 2,
    title: 'The Token Thief',
    brief:
      "Colors are broken across the whole system. Someone touched a hook they shouldn't have. You're deep in the components folder — navigate to hooks and expose useTokens.ts.",
    startPath: ['~', 'Projects', 'design-system', 'src', 'components', 'Modal'],
    targetDir: ['~', 'Projects', 'design-system', 'src', 'hooks'],
    targetFile: 'useTokens.ts',
    successMessage: 'There it is. useTokens.ts — your colors live here.',
  },
  {
    id: 3,
    title: 'Ghost Component',
    brief:
      "There's a legacy component causing import conflicts. It's not in the main source — someone stashed it in the archive a while back. Find LegacyButton.tsx.",
    startPath: ['~', 'Projects', 'design-system', 'src'],
    targetDir: ['~', 'Projects', 'archive', 'old-components'],
    targetFile: 'LegacyButton.tsx',
    successMessage: 'Got it. LegacyButton.tsx — haunting the archive.',
  },
]

// ── FS query helpers (used by useHunt) ────────────────────────

export function fsGetNode(path: string[]): FsNode | null {
  let node: FsNode = FS
  for (const segment of path.slice(1)) {
    const child = node.children?.find((c) => c.name === segment)
    if (!child) return null
    node = child
  }
  return node
}

export function fsListChildren(path: string[]): FsNode[] {
  const node = fsGetNode(path)
  if (!node || node.type !== 'dir') return []
  return node.children ?? []
}

export function fsResolveCd(currentPath: string[], arg: string): string[] | null {
  if (arg === '~') return ['~']
  if (arg === '..') return currentPath.length <= 1 ? ['~'] : currentPath.slice(0, -1)
  const newPath = [...currentPath, arg]
  const node = fsGetNode(newPath)
  if (!node || node.type !== 'dir') return null
  return newPath
}

export function pathToString(path: string[]): string {
  return path.join('/')
}

export function pathsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((s, i) => s === b[i])
}
