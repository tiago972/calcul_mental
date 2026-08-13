import { createContext, useContext } from 'react'
import { nextLevel } from '@/core/adaptive'
import { dayKey } from '@/core/stats'
import { defaultState } from './schema'
import type { Settings, State } from './schema'
import type { Attempt } from '@/core/types'

export type Action =
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'record'; attempt: Attempt }
  | { type: 'endSession'; ts: number; n: number; medianMs: number | null; rate: number | null }
  | { type: 'replace'; state: State }
  | { type: 'reset' }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'record': {
      const a = action.attempt
      const prev = state.levels[a.typeId]
      return {
        ...state,
        attempts: [...state.attempts, a],
        levels: {
          ...state.levels,
          [a.typeId]: nextLevel(prev, {
            correct: a.correct,
            ms: a.ms,
            targetMs: state.settings.targetMs,
          }),
        },
      }
    }

    case 'endSession': {
      // Une séance vide ne compte pas dans la série : elle ne s'achète pas.
      if (action.n === 0) return state
      const day = dayKey(action.ts)
      return {
        ...state,
        days: state.days.includes(day) ? state.days : [...state.days, day].sort(),
        sessions: [
          ...state.sessions,
          { ts: action.ts, n: action.n, medianMs: action.medianMs, rate: action.rate },
        ],
      }
    }

    case 'replace':
      return action.state

    case 'reset':
      return { ...defaultState(), settings: state.settings }
  }
}

export type AppCtx = { state: State; dispatch: (a: Action) => void }

export const AppContext = createContext<AppCtx | null>(null)

export function useApp(): AppCtx {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('AppContext manquant')
  return ctx
}
