import { useState, useCallback } from 'react'
import {
  hunts,
  fsListChildren,
  fsResolveCd,
  pathsEqual,
  type Hunt,
} from '../data/hunts'

export type HuntState = 'active' | 'success'

export interface HistoryEntry {
  command: string
  path: string[]     // the path at the time this command was run
  output: string[]   // lines; target file is prefixed with "__TARGET__:"
  isError: boolean
}

export function useHunt() {
  const [huntIndex, setHuntIndex]     = useState(0)
  const [currentPath, setCurrentPath] = useState<string[]>(hunts[0].startPath)
  const [history, setHistory]         = useState<HistoryEntry[]>([])
  const [huntState, setHuntState]     = useState<HuntState>('active')
  const [inputValue, setInputValue]   = useState('')
  const [commandCount, setCommandCount] = useState(0)

  const hunt: Hunt = hunts[huntIndex]
  const isLastHunt = huntIndex === hunts.length - 1

  const submitCommand = useCallback(
    (raw: string) => {
      const input = raw.trim()
      if (!input || huntState === 'success') return

      const parts = input.split(/\s+/)
      const cmd   = parts[0].toLowerCase()
      const arg   = parts.slice(1).join(' ')

      let output: string[] = []
      let isError = false
      let newPath = currentPath
      let willSucceed = false

      if (cmd === 'pwd') {
        output = [currentPath.join('/')]
      } else if (cmd === 'ls') {
        const children = fsListChildren(currentPath)
        const atTarget = pathsEqual(currentPath, hunt.targetDir)

        output = children.map((c) => {
          const label = c.type === 'dir' ? `${c.name}/` : c.name
          if (atTarget && c.name === hunt.targetFile) return `__TARGET__:${c.name}`
          return label
        })

        if (atTarget) willSucceed = true
      } else if (cmd === 'cd') {
        const target = arg || '~'
        const resolved = fsResolveCd(currentPath, target)
        if (resolved) {
          newPath = resolved
          output = []
        } else {
          output = [`cd: ${arg}: No such file or directory`]
          isError = true
        }
      } else {
        output = [`${cmd}: command not found`]
        isError = true
      }

      setHistory((prev) => [...prev, { command: input, path: currentPath, output, isError }])
      setCurrentPath(newPath)
      setCommandCount((n) => n + 1)
      setInputValue('')

      if (willSucceed) {
        setTimeout(() => setHuntState('success'), 350)
      }
    },
    [currentPath, hunt, huntState],
  )

  const goNextHunt = useCallback(() => {
    if (isLastHunt) return
    const next = huntIndex + 1
    setHuntIndex(next)
    setCurrentPath(hunts[next].startPath)
    setHistory([])
    setHuntState('active')
    setInputValue('')
    setCommandCount(0)
  }, [huntIndex, isLastHunt])

  const resetHunt = useCallback(() => {
    setCurrentPath(hunt.startPath)
    setHistory([])
    setHuntState('active')
    setInputValue('')
    setCommandCount(0)
  }, [hunt])

  return {
    hunt,
    huntIndex,
    totalHunts: hunts.length,
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
  }
}
