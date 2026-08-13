import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { randomRng } from '@/core/rng'
import { BLOCK_MS, BLOCKS, nextQuestion, PAUSE_MS } from '@/core/session'
import { check } from '@/core/tolerance'
import { t, tPhrase } from '@/i18n'
import { useApp } from '@/store/useApp'
import { appendKey, decimalOf, Keypad, parseInput } from '../components/Keypad'
import { BlockBar, BlockTimer, QuestionTimer } from '../components/Timer'
import { answerHintKey, formatAnswer, formatNum, formatSeconds } from '../format'
import { putClip, startRecording } from '@/audio/recorder'
import type { Recorder } from '@/audio/recorder'
import type { Attempt, Question } from '@/core/types'
import { PressButton } from '../components/PressButton'

const SPEAK_MS = 3000

/** Secondes restantes, bornées : sans le plafond on affiche 4 pour 3 000 ms + ε. */
const secondsLeft = (until: number, now: number, totalMs: number) =>
  Math.max(0, Math.min(totalMs / 1000, Math.ceil((until - now) / 1000)))

type Result = { q: Question; given: number | null; ok: boolean; late: boolean; ms: number }

/**
 * `load` est l'état charnière : il dit « il faut tirer une question ».
 * Sans lui, remettre `q` à null suffisait à relancer un tirage, mais la phase
 * restait sur `feedback` et l'effet d'horloge rappelait `advance()` dans la
 * foulée — la question fraîchement tirée était effacée et l'écran restait vide.
 */
type Phase =
  | { k: 'load' }
  | { k: 'speak'; until: number }
  | { k: 'ask' }
  | { k: 'feedback'; res: Result; until: number }
  | { k: 'pause'; until: number }

/** Bip discret au passage de la cible, si le réglage est actif. */
function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 660
    gain.gain.value = 0.04
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.08)
    setTimeout(() => ctx.close(), 300)
  } catch {
    /* pas de son : sans conséquence */
  }
}

export function Session({ onDone }: { onDone: (attempts: Attempt[]) => void }) {
  const { state, dispatch } = useApp()
  const { lang, targetMs, feedbackMs, verbalize, audio, sound } = state.settings

  const rng = useRef(randomRng())
  const recorder = useRef<Recorder | null>(null)
  const beeped = useRef(false)
  const done = useRef(false)

  const [now, setNow] = useState(() => Date.now())
  const [block, setBlock] = useState(0)
  const [blockEndsAt, setBlockEndsAt] = useState(() => Date.now() + BLOCK_MS)
  const [q, setQ] = useState<Question | null>(null)
  const [phase, setPhase] = useState<Phase>({ k: 'load' })
  const [askedAt, setAskedAt] = useState(() => Date.now())
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])

  // Une seule horloge pour toute la séance.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  const history = useMemo(() => [...state.attempts, ...attempts], [state.attempts, attempts])

  const ask = useCallback(() => {
    const question = nextQuestion(state.levels, history, rng.current)
    const ts = Date.now()
    setQ(question)
    setInput('')
    beeped.current = false
    if (verbalize) {
      setPhase({ k: 'speak', until: ts + SPEAK_MS })
      setAskedAt(ts + SPEAK_MS)
      if (audio) startRecording().then((r) => (recorder.current = r))
    } else {
      setPhase({ k: 'ask' })
      setAskedAt(ts)
    }
    // `history` change à chaque réponse : on ne le met pas en dépendance,
    // la question suivante lit volontairement l'état au moment du tirage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.levels, verbalize, audio])

  useEffect(() => {
    if (phase.k === 'load') ask()
  }, [phase.k, ask])

  const finish = useCallback(
    (given: number | null) => {
      if (!q) return
      const ms = Math.max(0, Date.now() - askedAt)
      const ok = given !== null && check(given, q).ok
      const attempt: Attempt = { ts: Date.now(), typeId: q.typeId, level: q.level, ms, correct: ok, given }

      dispatch({ type: 'record', attempt })
      setAttempts((a) => [...a, attempt])
      // feedbackMs à 0 : la correction reste affichée jusqu'au tap.
      const until = feedbackMs === 0 ? Infinity : Date.now() + feedbackMs
      setPhase({ k: 'feedback', res: { q, given, ok, late: ms > targetMs, ms }, until })

      const rec = recorder.current
      recorder.current = null
      if (rec) rec.stop().then((blob) => blob && putClip({ id: attempt.ts, blob, typeId: q.typeId }))
    },
    [q, askedAt, targetMs, feedbackMs, dispatch],
  )

  /** Arrêt anticipé compris : les réponses déjà données comptent, on va au bilan. */
  const stop = useCallback(
    (list: Attempt[]) => {
      if (done.current) return
      done.current = true
      onDone(list)
    },
    [onDone],
  )

  const advance = useCallback(() => {
    // Le bloc n'interrompt jamais une question en cours : on vérifie ici.
    if (Date.now() < blockEndsAt) {
      setPhase({ k: 'load' })
      return
    }
    if (block + 1 >= BLOCKS) {
      stop(attempts)
      return
    }
    setPhase({ k: 'pause', until: Date.now() + PAUSE_MS })
  }, [blockEndsAt, block, attempts, stop])

  const startNextBlock = useCallback(() => {
    setBlock((b) => b + 1)
    setBlockEndsAt(Date.now() + BLOCK_MS)
    setPhase({ k: 'load' })
  }, [])

  // Transitions pilotées par l'horloge.
  useEffect(() => {
    if (phase.k === 'speak' && now >= phase.until) setPhase({ k: 'ask' })
    else if (phase.k === 'feedback' && now >= phase.until) advance()
    else if (phase.k === 'pause' && now >= phase.until) startNextBlock()
    else if (phase.k === 'ask' && sound && !beeped.current && now - askedAt > targetMs) {
      beeped.current = true
      beep()
    }
  }, [now, phase, advance, startNextBlock, sound, askedAt, targetMs])

  if (phase.k === 'pause') {
    return (
      <div className="mx-auto flex screen max-w-md flex-col items-center justify-center px-5 safe-t safe-b">
        <div className="text-sm uppercase tracking-wide text-muted">{t('session.pause', lang)}</div>
        <div className="mt-4 text-7xl font-light tabular-nums text-accent">
          {secondsLeft(phase.until, now, PAUSE_MS)}
        </div>
        <p className="mt-6 text-center text-sm text-muted">{t('session.pause.hint', lang)}</p>
        <PressButton className="tap mt-10 px-4 text-sm text-accent" onActivate={startNextBlock}>
          {t('session.pause.skip', lang)}
        </PressButton>
      </div>
    )
  }

  if (!q || phase.k === 'load') return <div className="screen" />

  const elapsed = Math.max(0, now - askedAt)
  const speaking = phase.k === 'speak'

  return (
    <div className="screen-fixed mx-auto flex max-w-md flex-col safe-t safe-b">
      <BlockBar leftMs={Math.max(0, blockEndsAt - now)} totalMs={BLOCK_MS} />

      <header className="flex items-center justify-between px-5 pt-3 text-xs text-muted">
        <PressButton onActivate={() => stop(attempts)} className="tap -mx-2 px-2 text-muted">
          {t('session.quit', lang)}
        </PressButton>
        <span>{t('session.block', lang, { n: block + 1, total: BLOCKS })}</span>
        <BlockTimer leftMs={Math.max(0, blockEndsAt - now)} />
      </header>

      {phase.k === 'feedback' ? (
        <Feedback res={phase.res} onNext={advance} />
      ) : (
        <>
          <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 text-center">
            <p className="text-[1.7rem] font-light leading-snug text-ink">
              {tPhrase(q.prompt, lang)}
            </p>
            <p className="mt-4 text-xs text-muted">
              {t(answerHintKey(q.answer.style, q.answer.scale), lang)}
            </p>
            {speaking && (
              <div className="mt-8">
                <div className="text-sm text-accent">{t('session.speak', lang)}</div>
                <div className="mt-1 text-4xl font-light tabular-nums text-accent">
                  {Math.max(1, secondsLeft(phase.until, now, SPEAK_MS))}
                </div>
              </div>
            )}
          </main>

          <div className="shrink-0 px-5 pb-4">
            <div className="mb-3 flex items-baseline justify-between border-b border-hair pb-2">
              <span className="text-3xl tabular-nums text-ink">{input || ' '}</span>
              {!speaking && <QuestionTimer elapsedMs={elapsed} targetMs={targetMs} />}
            </div>
            <Keypad
              value={input}
              onKey={(k) => setInput((v) => appendKey(v, k, decimalOf(lang)))}
              onSubmit={() => finish(parseInput(input, lang))}
              onSkip={() => finish(null)}
              style={q.answer.style}
              lang={lang}
              disabled={speaking}
              submitLabel={t('session.validate', lang)}
              skipLabel={t('session.dontKnow', lang)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function Feedback({ res, onNext }: { res: Result; onNext: () => void }) {
  const { state } = useApp()
  const lang = state.settings.lang
  const { q } = res

  const verdict = res.given === null
    ? 'feedback.skipped'
    : res.ok
      ? res.late ? 'feedback.late' : 'feedback.correct'
      : 'feedback.incorrect'

  const expected = q.answerDisplay
    ? formatNum(q.answerDisplay, lang)
    : formatAnswer(q.rounded, q.answer, lang)

  return (
    /* Un vrai <button> et non un <div onClick> : iOS ne fait pas remonter les
       clics depuis un élément non interactif, le tap pour passer à la question
       suivante y était purement et simplement perdu. */
    <PressButton
      className="flex min-h-0 w-full flex-1 flex-col justify-center overflow-y-auto px-5 text-left"
      onActivate={onNext}
    >
      <div className={`text-sm font-medium ${res.ok && !res.late ? 'text-accent' : 'text-ink'}`}>
        {t(verdict, lang)}
      </div>

      <p className="mt-3 text-lg font-light text-muted">{tPhrase(q.prompt, lang)}</p>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-4xl font-light text-ink">{expected}</span>
        <span className="text-sm text-muted">
          {t('feedback.exact', lang)} {formatAnswer(q.exact, q.answer, lang, 3)}
        </span>
      </div>

      <ol className="mt-5 space-y-2 border-l-2 border-accent-line pl-3">
        {q.steps.map((step, i) => (
          <li
            key={step.key}
            /* La dernière étape conclut : c'est elle qu'on relit d'un coup d'œil. */
            className={`text-sm leading-relaxed tabular-nums ${
              i === q.steps.length - 1 ? 'text-ink' : 'text-muted'
            }`}
          >
            {tPhrase(step, lang)}
          </li>
        ))}
      </ol>

      <p className="mt-5 text-sm text-muted">
        {t('feedback.time', lang)} {formatSeconds(res.ms, lang)}
      </p>

      <p className="mt-8 text-xs text-muted">{t('feedback.next', lang)}</p>
    </PressButton>
  )
}
