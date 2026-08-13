import { roundestWithin } from '../tolerance'
import { pickScale, SCALE_FACTOR } from '../numbers'
import type { AnswerSpec, Level, Num, NumStyle, Phrase, Question, Tolerance, TypeId } from '../types'

type Spec = {
  typeId: TypeId
  level: Level
  prompt: Phrase
  steps: Phrase[]
  exact: number
  answer: AnswerSpec
  tolerance: Tolerance
  answerDisplay?: Num
}

/** `rounded` n'est jamais saisi à la main : c'est toujours le plus rond des acceptables. */
export function build(s: Spec): Question {
  return { ...s, rounded: roundestWithin(s.exact, s.tolerance) }
}

/**
 * Ramène une valeur brute à l'unité dans laquelle on la pose à l'oral :
 * 1 596 000 se saisit « 1,6 » en M, 612 se saisit « 612 ».
 */
export function asAnswer(raw: number, style: NumStyle): { exact: number; answer: AnswerSpec } {
  const scale = pickScale(raw)
  return { exact: raw / SCALE_FACTOR[scale], answer: { style, scale } }
}

/** Sélection d'une valeur par niveau, sans cascade de `if`. */
export function byLevel<T>(level: Level, table: readonly [T, T, T, T, T]): T {
  return table[level - 1]
}

export const REL = (pct: number): Tolerance => ({ kind: 'rel', pct })
export const ABS = (delta: number): Tolerance => ({ kind: 'abs', delta })
export const EXACT = (d: number): Tolerance => ({ kind: 'exact', d })
