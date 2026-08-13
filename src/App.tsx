import { useEffect, useMemo, useReducer, useState } from 'react'
import { median, successRate } from '@/core/stats'
import { load, save } from '@/store/storage'
import { AppContext, reducer } from '@/store/useApp'
import { Home } from '@/ui/screens/Home'
import { Session } from '@/ui/screens/Session'
import { Settings } from '@/ui/screens/Settings'
import { Stats } from '@/ui/screens/Stats'
import { Summary } from '@/ui/screens/Summary'
import type { Attempt } from '@/core/types'

type Screen = 'home' | 'session' | 'summary' | 'stats' | 'settings'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [screen, setScreen] = useState<Screen>('home')
  const [last, setLast] = useState<Attempt[]>([])

  useEffect(() => save(state), [state])
  useEffect(() => {
    document.documentElement.lang = state.settings.lang
  }, [state.settings.lang])

  const ctx = useMemo(() => ({ state, dispatch }), [state])

  const endSession = (attempts: Attempt[]) => {
    dispatch({
      type: 'endSession',
      ts: Date.now(),
      n: attempts.length,
      medianMs: median(attempts.map((a) => a.ms)),
      rate: successRate(attempts),
    })
    setLast(attempts)
    setScreen('summary')
  }

  return (
    <AppContext.Provider value={ctx}>
      {screen === 'home' && (
        <Home
          onStart={() => setScreen('session')}
          onStats={() => setScreen('stats')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'session' && (
        // La clé force une séance neuve à chaque départ.
        <Session key={last.length} onDone={endSession} />
      )}
      {screen === 'summary' && <Summary attempts={last} onHome={() => setScreen('home')} />}
      {screen === 'stats' && <Stats onBack={() => setScreen('home')} />}
      {screen === 'settings' && <Settings onBack={() => setScreen('home')} />}
    </AppContext.Provider>
  )
}
