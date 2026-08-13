import { defaultState, MAX_ATTEMPTS, parseState, STORAGE_KEY } from './schema'
import type { State } from './schema'

/** Une donnée corrompue ne doit jamais empêcher l'application de démarrer. */
export function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return parseState(JSON.parse(raw)) ?? defaultState()
  } catch {
    return defaultState()
  }
}

export function save(state: State): void {
  try {
    const trimmed: State =
      state.attempts.length > MAX_ATTEMPTS
        ? { ...state, attempts: state.attempts.slice(-MAX_ATTEMPTS) }
        : state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Quota plein ou stockage refusé : la séance en cours continue en mémoire.
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* rien à faire */
  }
}
