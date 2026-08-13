import { describe, expect, it } from 'vitest'
import { appendKey, decimalOf, parseInput } from '@/ui/components/Keypad'

const fr = decimalOf('fr')
const en = decimalOf('en')

/** Enchaîne des touches comme le fait la mise à jour fonctionnelle du parent. */
const type = (keys: string[], dec = fr) => keys.reduce((v, k) => appendKey(v, k, dec), '')

describe('saisie au pavé', () => {
  it('accumule les chiffres, y compris deux appuis d’affilée', () => {
    expect(type(['5', '0'])).toBe('50')
    expect(type(['1', '2', '3', '4'])).toBe('1234')
  })

  it('efface', () => {
    expect(type(['1', '2', 'back'])).toBe('1')
    expect(type(['back'])).toBe('')
  })

  it('une seule virgule, et un zéro devant si elle ouvre la saisie', () => {
    expect(type(['1', ',', '6'])).toBe('1,6')
    expect(type([',', '5'])).toBe('0,5')
    expect(type(['1', ',', '6', ',', '2'])).toBe('1,62')
  })

  it('le raccourci 000 ne démarre pas une saisie', () => {
    expect(type(['000'])).toBe('')
    expect(type(['2', '5', '000'])).toBe('25000')
  })

  it('une seule barre de fraction, jamais en tête', () => {
    expect(type(['/'])).toBe('')
    expect(type(['5', '/', '8'])).toBe('5/8')
    expect(type(['5', '/', '8', '/', '3'])).toBe('5/83')
  })

  it('une virgule reste possible au dénominateur d’une fraction… une seule fois', () => {
    expect(type(['1', ',', '5', '/', '2', ',', '5'])).toBe('1,5/2,5')
    expect(type(['1', '/', '2', ',', '5', ','])).toBe('1/2,5')
  })

  it('borne la longueur pour éviter les saisies absurdes', () => {
    expect(type(Array(15).fill('7')).replace(/[^0-9]/g, '')).toHaveLength(9)
  })

  it('utilise le point en anglais', () => {
    expect(type(['1', en, '6'], en)).toBe('1.6')
  })
})

describe('lecture de la saisie', () => {
  it('virgule française, point anglais', () => {
    expect(parseInput('1,6', 'fr')).toBeCloseTo(1.6, 10)
    expect(parseInput('1.6', 'en')).toBeCloseTo(1.6, 10)
  })

  it('fractions', () => {
    expect(parseInput('5/8', 'fr')).toBeCloseTo(0.625, 10)
    expect(parseInput('10/16', 'fr')).toBeCloseTo(0.625, 10)
    expect(parseInput('1/3', 'fr')).toBeCloseTo(1 / 3, 10)
  })

  it('refuse ce qui n’est pas un nombre', () => {
    expect(parseInput('', 'fr')).toBeNull()
    expect(parseInput('5/', 'fr')).toBeNull()
    expect(parseInput('/8', 'fr')).toBeNull()
    expect(parseInput('5/0', 'fr')).toBeNull()
    expect(parseInput(',', 'fr')).toBeNull()
  })

  it('la saisie complète du pavé se relit sans perte', () => {
    expect(parseInput(type(['1', ',', '6']), 'fr')).toBeCloseTo(1.6, 10)
    expect(parseInput(type(['5', '/', '8']), 'fr')).toBeCloseTo(0.625, 10)
  })
})
