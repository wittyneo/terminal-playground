import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { LessonView }  from './components/LessonView'
import { HuntView }    from './components/HuntView'
import { PestView }    from './components/PestView'

type Mode = 'landing' | 'lesson' | 'hunt' | 'pest'

export default function App() {
  const [mode, setMode] = useState<Mode>('landing')

  if (mode === 'hunt') {
    return <HuntView onExitHunt={() => setMode('lesson')} />
  }

  if (mode === 'pest') {
    return <PestView onExit={() => setMode('lesson')} />
  }

  if (mode === 'lesson') {
    return (
      <LessonView
        onEnterHunt={() => setMode('hunt')}
        onEnterPest={() => setMode('pest')}
      />
    )
  }

  return <LandingPage />
}
