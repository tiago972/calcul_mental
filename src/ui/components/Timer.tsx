import { formatClock } from '../format'

/** Chrono de question : discret tant qu'on est dans la cible, net au-delà. */
export function QuestionTimer({ elapsedMs, targetMs }: { elapsedMs: number; targetMs: number }) {
  const over = elapsedMs > targetMs
  const left = Math.max(0, Math.ceil((targetMs - elapsedMs) / 1000))
  return (
    <span
      className={`text-sm tabular-nums ${over ? 'text-accent' : 'text-muted'}`}
      aria-live="off"
    >
      {over ? `+${Math.floor((elapsedMs - targetMs) / 1000)} s` : `${left} s`}
    </span>
  )
}

export function BlockTimer({ leftMs }: { leftMs: number }) {
  return <span className="text-sm tabular-nums text-muted">{formatClock(leftMs)}</span>
}

/** Barre de progression du bloc, épaisseur d'un cheveu. */
export function BlockBar({ leftMs, totalMs }: { leftMs: number; totalMs: number }) {
  const pct = Math.max(0, Math.min(100, (leftMs / totalMs) * 100))
  return (
    <div className="h-0.5 w-full bg-hair">
      <div className="h-0.5 bg-accent-line transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}
