import { useState, useCallback } from 'react'
import { lessons, type Lesson, type Category } from '../data/lessons'

export type TerminalState = 'active' | 'success' | 'danger-warn' | 'error'

export function useLesson() {
  const [lessonIndex, setLessonIndex] = useState(0)
  const [terminalState, setTerminalState] = useState<TerminalState>('active')
  const [inputValue, setInputValue] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const lesson: Lesson = lessons[lessonIndex]
  const isFirst = lessonIndex === 0
  const isLast = lessonIndex === lessons.length - 1
  const totalLessons = lessons.length
  const progress = ((lessonIndex) / totalLessons) * 100

  const submitCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim().toLowerCase()
      const accepted = lesson.acceptedInputs.map((a) => a.trim().toLowerCase())

      if (accepted.includes(trimmed)) {
        if (lesson.isDanger && terminalState !== 'danger-warn') {
          setTerminalState('danger-warn')
          return
        }
        setTerminalState('success')
        setShowOutput(true)
        setErrorCount(0)
        setShowHint(false)
      } else {
        const newCount = errorCount + 1
        setErrorCount(newCount)
        setTerminalState('error')
        if (newCount >= 2) setShowHint(true)
        // Reset error state after shake animation
        setTimeout(() => setTerminalState('active'), 500)
      }
    },
    [lesson, terminalState, errorCount],
  )

  const confirmDanger = useCallback(() => {
    setTerminalState('success')
    setShowOutput(true)
  }, [])

  const cancelDanger = useCallback(() => {
    setTerminalState('active')
  }, [])

  const goNext = useCallback(() => {
    if (isLast) return
    setLessonIndex((i) => i + 1)
    setTerminalState('active')
    setInputValue('')
    setShowOutput(false)
    setErrorCount(0)
    setShowHint(false)
  }, [isLast])

  const goPrev = useCallback(() => {
    if (isFirst) return
    setLessonIndex((i) => i - 1)
    setTerminalState('active')
    setInputValue('')
    setShowOutput(false)
    setErrorCount(0)
    setShowHint(false)
  }, [isFirst])

  const goToLesson = useCallback((index: number) => {
    setLessonIndex(index)
    setTerminalState('active')
    setInputValue('')
    setShowOutput(false)
    setErrorCount(0)
    setShowHint(false)
  }, [])

  const goToCategory = useCallback((cat: Category) => {
    const index = lessons.findIndex(l => l.category === cat)
    if (index >= 0) {
      setLessonIndex(index)
      setTerminalState('active')
      setInputValue('')
      setShowOutput(false)
      setErrorCount(0)
      setShowHint(false)
    }
  }, [])

  return {
    lesson,
    lessonIndex,
    totalLessons,
    progress,
    isFirst,
    isLast,
    terminalState,
    inputValue,
    setInputValue,
    showOutput,
    showHint,
    errorCount,
    submitCommand,
    confirmDanger,
    cancelDanger,
    goNext,
    goPrev,
    goToLesson,
    goToCategory,
  }
}
