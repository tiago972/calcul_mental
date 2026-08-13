import { useEffect } from 'react'
import type React from 'react'
import type { Lang, NumStyle } from '@/core/types'

const DECIMAL: Record<Lang, string> = { fr: ',', en: '.' }

export const decimalOf = (lang: Lang) => DECIMAL[lang]

export type KeypadProps = {
  value: string
  /**
   * Reçoit la touche, pas la valeur : le parent applique `appendKey` dans une
   * mise à jour fonctionnelle. Deux appuis dans la même frame React ne peuvent
   * donc pas s'écraser l'un l'autre.
   */
  onKey: (key: string) => void
  onSubmit: () => void
  onSkip: () => void
  /** La touche « / » ne sert qu'aux questions dont la réponse est une fraction. */
  style: NumStyle
  lang: Lang
  disabled?: boolean
  submitLabel: string
  skipLabel: string
}

export function appendKey(value: string, key: string, decimal: string): string {
  if (key === 'back') return value.slice(0, -1)
  if (key === decimal) {
    // Une seule virgule, et pas dans le dénominateur d'une fraction.
    const tail = value.split('/').pop() ?? ''
    return tail.includes(decimal) ? value : value === '' ? `0${decimal}` : value + decimal
  }
  if (key === '/') return value === '' || value.includes('/') ? value : value + '/'
  if (key === '000') return value === '' ? value : value + '000'
  if (value.replace(/[^0-9]/g, '').length >= 9) return value
  return value + key
}

export function Keypad(p: KeypadProps) {
  const dec = DECIMAL[p.lang]
  const fraction = p.style === 'fraction'

  // Accessible au clavier sur ordinateur : chiffres, Entrée, Espace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (p.disabled) return
      if (e.key >= '0' && e.key <= '9') p.onKey(e.key)
      else if (e.key === ',' || e.key === '.') p.onKey(dec)
      else if (e.key === '/' && fraction) p.onKey('/')
      else if (e.key === 'Backspace') p.onKey('back')
      else if (e.key === 'Enter') p.onSubmit()
      else if (e.key === ' ') {
        e.preventDefault()
        p.onSkip()
      } else return
      e.stopPropagation()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /**
   * Déclenche à la pose du doigt, pas au relâchement. iOS annule le clic dès
   * que le doigt glisse un peu entre les deux — ce qui est systématique debout
   * dans les transports, et donnait un pavé qui « rate » des touches.
   * `detail === 0` isole les clics venus du clavier, qui n'ont pas de pointeur.
   */
  const presse = (k: string) => !p.disabled && p.onKey(k)
  const tactile = (k: string) => ({
    onPointerDown: () => presse(k),
    onClick: (e: React.MouseEvent) => e.detail === 0 && presse(k),
  })

  const Key = ({ k, label }: { k: string; label?: string }) => (
    <button type="button" className="key" {...tactile(k)} aria-label={label ?? k}>
      {label ?? k}
    </button>
  )

  return (
    <div className="select-none">
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <Key key={k} k={k} />
        ))}
        <Key k={fraction ? '/' : dec} />
        <Key k="0" />
        <Key k="back" label="←" />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button type="button" className="key col-span-1 text-base" {...tactile('000')}>
          000
        </button>
        <button
          type="button"
          className="col-span-2 rounded-xl bg-accent px-4 text-base font-medium text-white active:opacity-80 disabled:opacity-30"
          onPointerDown={() => !p.disabled && p.value !== '' && p.onSubmit()}
          onClick={(e) => e.detail === 0 && p.onSubmit()}
          disabled={p.disabled || p.value === ''}
        >
          {p.submitLabel}
        </button>
      </div>

      <button type="button" className="mt-2 w-full py-4 text-sm text-muted" onClick={p.onSkip}>
        {p.skipLabel}
      </button>
    </div>
  )
}

/** « 1,6 » → 1.6 ; « 5/8 » → 0.625 ; saisie inexploitable → null. */
export function parseInput(value: string, lang: Lang): number | null {
  const s = (lang === 'fr' ? value.replace(/,/g, '.') : value).trim()
  if (s === '') return null
  if (s.includes('/')) {
    const [a, b] = s.split('/')
    const num = Number(a)
    const den = Number(b)
    if (a === '' || b === '' || !Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null
    return num / den
  }
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}
