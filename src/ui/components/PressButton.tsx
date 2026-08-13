import { useRef } from 'react'
import type {
  ButtonHTMLAttributes,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'

/**
 * Déplacement maximal, en pixels, pour qu'un appui reste un appui. Au-delà,
 * c'est un balayage : on défile, on ne déclenche pas.
 */
const TAP_MAX = 40

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  onActivate: () => void
}

type Point = { x: number; y: number }

/**
 * Bouton d'action tolérant au doigt qui glisse.
 *
 * Séquence relevée sur un vrai iOS pour un appui qui dérive de quelques
 * dizaines de pixels :
 *
 *   pointerdown · touchstart · pointermove · touchmove · pointermove ·
 *   pointercancel · touchmove · touchend
 *
 * Ni `pointerup`, ni `click` : dès qu'il soupçonne un balayage, iOS annule le
 * pointeur. D'où des boutons qui semblent ne pas répondre, ce qui est
 * systématique debout dans les transports.
 *
 * Les événements tactiles, eux, vont jusqu'au bout : `touchend` arrive même
 * après l'annulation du pointeur, avec ses coordonnées. Ce sont donc eux qui
 * font foi au doigt, et les événements pointeur seulement à la souris.
 *
 * Se rabattre sur la dernière position vue en `pointermove` ne suffisait pas :
 * sur un balayage franc, iOS annule le pointeur avant d'en délivrer un seul,
 * le déplacement paraissait donc nul et un simple défilement déclenchait le
 * bouton qu'il avait sous le doigt.
 *
 * Le relâchement plutôt que la pose garde le geste délibéré, ce qui compte pour
 * « Je ne sais pas », qui fait perdre la question, et « Arrêter la séance ».
 */
export function PressButton({ onActivate, children, ...rest }: Props) {
  const depart = useRef<Point | null>(null)

  const loin = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y) > TAP_MAX

  return (
    <button
      type="button"
      {...rest}
      onTouchStart={(e: ReactTouchEvent<HTMLButtonElement>) => {
        const t = e.touches[0]
        depart.current = t ? { x: t.clientX, y: t.clientY } : null
      }}
      onTouchEnd={(e: ReactTouchEvent<HTMLButtonElement>) => {
        const d = depart.current
        depart.current = null
        const t = e.changedTouches[0]
        if (!d || !t) return
        if (!loin(d, { x: t.clientX, y: t.clientY })) onActivate()
      }}
      onTouchCancel={() => (depart.current = null)}
      // À la souris et au stylet le pointeur n'est jamais annulé.
      onPointerUp={(e: ReactPointerEvent<HTMLButtonElement>) => {
        if (e.pointerType !== 'touch') onActivate()
      }}
      // Un clic sans pointeur vient du clavier : detail vaut alors 0.
      onClick={(e: MouseEvent) => e.detail === 0 && onActivate()}
    >
      {children}
    </button>
  )
}
