import type { Rng } from './types'

/**
 * mulberry32 : générateur déterministe de 32 bits, suffisant ici et surtout
 * rejouable — c'est ce qui rend les tests des générateurs reproductibles.
 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)],
  }
}

/** RNG non déterministe, pour l'application. */
export function randomRng(): Rng {
  return makeRng((Math.random() * 2 ** 32) >>> 0)
}
