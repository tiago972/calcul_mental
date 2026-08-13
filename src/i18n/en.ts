import type { Key } from './fr'

export const en: Record<Key, string> = {
  'app.title': 'Case Math',

  // — Home ———————————————————————————————————————————————————
  'home.start': 'Start',
  'home.streak.one': 'day in a row',
  'home.streak.many': 'days in a row',
  'home.streak.none': 'First session',
  'home.stats': 'Statistics',
  'home.settings': 'Settings',
  'home.duration': '3 blocks of 5 minutes',

  // — Session —————————————————————————————————————————————————
  'session.block': 'Block {n} of {total}',
  'session.pause': 'Break',
  'session.pause.hint': 'Breathe. The next block starts on its own.',
  'session.pause.skip': 'Skip the break',
  'session.dontKnow': 'I don’t know',
  'session.validate': 'Submit',
  'session.speak': 'Say your reasoning out loud',
  'session.speak.go': 'Go',
  'session.quit': 'End session',

  // — Feedback ————————————————————————————————————————————————
  'feedback.correct': 'Correct',
  'feedback.incorrect': 'Wrong',
  'feedback.late': 'Correct, but over time',
  'feedback.skipped': 'Skipped',
  'feedback.expected': 'Expected answer',
  'feedback.exact': 'Exact value',
  'feedback.path': 'Reasoning',
  'feedback.time': 'Time',
  'feedback.next': 'Tap to continue',

  // — End of session ——————————————————————————————————————————
  'summary.title': 'Session complete',
  'summary.median': 'Median time',
  'summary.rate': 'Accuracy',
  'summary.count': '{n} questions',
  'summary.weakest': 'Work on',
  'summary.advice': 'Tomorrow',
  'summary.home': 'Back',
  'advice.slow':
    'You are accurate but slow: tomorrow, force yourself to state an order of magnitude before computing.',
  'advice.rushed':
    'You are fast but off target: tomorrow, round less brutally — keep two significant digits.',
  'advice.weakType': 'Tomorrow, start with {type}: that is where you lose the most time.',
  'advice.good': 'Nothing to fix today. Come back tomorrow — regularity does the rest.',
  'advice.empty': 'Session too short to conclude. Come back tomorrow.',

  // — Statistics ———————————————————————————————————————————————
  'stats.title': 'Statistics',
  'stats.streak': 'Streak',
  'stats.days.one': 'day',
  'stats.days.many': 'days',
  'stats.byType': 'By type',
  'stats.type': 'Type',
  'stats.rate': 'Accuracy',
  'stats.median': 'Median',
  'stats.level': 'Level',
  'stats.trend': '30 d',
  'stats.medianCurve': 'Median time per session',
  'stats.none': 'No data yet. Run a first session.',
  'stats.export': 'Export (JSON)',
  'stats.import': 'Import',
  'stats.importOk': 'History imported.',
  'stats.importFail': 'Unreadable file: nothing was changed.',
  'stats.reset': 'Erase everything',
  'stats.reset.help': 'Streak, times, levels and recordings. Settings are kept.',
  'stats.resetConfirm': 'Permanently erase all history?',
  'stats.resetDone': 'History erased.',

  // — Settings ————————————————————————————————————————————————
  'settings.title': 'Settings',
  'settings.lang': 'Language',
  'settings.target': 'Time target per question',
  'settings.feedback': 'Correction reading time',
  'settings.feedback.manual': 'on tap',
  'settings.verbalize': 'Verbalisation mode',
  'settings.verbalize.help':
    'Three seconds before each question to say the reasoning out loud.',
  'settings.audio': 'Record the verbalisation',
  'settings.audio.help':
    'Audio stays on this device, inside the browser. Nothing is ever sent anywhere.',
  'settings.audio.denied': 'Microphone refused: recording stays off.',
  'settings.sound': 'Timer beep',
  'settings.back': 'Back',
  'settings.recordings': 'Recordings',
  'settings.recordings.none': 'No recordings.',
  'settings.recordings.clear': 'Delete recordings',

  // — Expected answer unit —————————————————————————————————————
  'answer.hint.percent': 'answer in %',
  'answer.hint.fraction': 'answer as a fraction, e.g. 3/8',
  'answer.hint.money.unit': 'answer in €',
  'answer.hint.money.k': 'answer in €k',
  'answer.hint.money.M': 'answer in €M',
  'answer.hint.money.Md': 'answer in €bn',
  'answer.hint.count.unit': 'answer in units',
  'answer.hint.count.k': 'answer in thousands of units',
  'answer.hint.count.M': 'answer in millions of units',
  'answer.hint.count.Md': 'answer in billions of units',
  'answer.hint.plain.unit': 'answer as a number',
  'answer.hint.plain.k': 'answer in thousands',
  'answer.hint.plain.M': 'answer in millions',
  'answer.hint.plain.Md': 'answer in billions',

  // — Type names ———————————————————————————————————————————————
  'type.magnitudeProduct': 'Orders of magnitude',
  'type.marketShare': 'Market share',
  'type.percentOf': 'Percentage of a number',
  'type.percentChange': 'Percentage change',
  'type.growthApply': 'Applied growth',
  'type.cagr': 'CAGR',
  'type.margin': 'Margin and profit',
  'type.breakeven': 'Break-even',
  'type.perUnit': 'Per-unit economics',
  'type.weightedMean': 'Weighted average',
  'type.fractions': 'Fractions',
  'type.marketSizing': 'Market sizing',

  // — Prompts and calculation paths —————————————————————————————
  'q.magnitudeProduct.prompt': '{a} × {b}',

  'q.marketShare.prompt':
    'In a {market} market, the client makes {client}. What is its market share?',

  'q.percentOf.prompt': '{p} of {n}',

  'q.percentChange.prompt': 'From {from} to {to}, what is the change?',

  'q.growthApply.prompt': '{base} growing {r} a year for {y} years. What amount?',

  'q.cagr.prompt': 'From {from} to {to} in {y} years. What annual rate?',

  'q.margin.prompt':
    'Revenue {rev}, gross margin {gm}, fixed costs {fixed}. What operating profit?',

  'q.breakeven.prompt':
    'Fixed costs {fixed}, unit margin {um}. What volume to break even?',

  'q.perUnit.prompt': '{total} spread over {cust} customers. How much per customer?',

  'q.weightedMean.prompt2': '2 segments: {w1} at {p1}, {w2} at {p2}. Average price?',
  'q.weightedMean.prompt3':
    '3 segments: {w1} at {p1}, {w2} at {p2}, {w3} at {p3}. Average price?',
  'q.weightedMean.prompt4':
    '4 segments: {w1} at {p1}, {w2} at {p2}, {w3} at {p3}, {w4} at {p4}. Average price?',

  'q.fractions.promptToPct': '{f} as a percentage',
  'q.fractions.promptToFrac': '{p} as a fraction',

  'q.marketSizing.prompt':
    'Population {pop}, {share} concerned, purchase frequency {freq} a year, {price} per unit. Market size?',

  // — Reasoning steps ——————————————————————————————————————————
  'q.magnitudeProduct.s1': 'Simplify both: {a} ≈ {a1}, {b} ≈ {b1}',
  'q.magnitudeProduct.s1a': 'Simplify {a} ≈ {a1}; {b} is already convenient',
  'q.magnitudeProduct.s1b': 'Simplify {b} ≈ {b1}; {a} is already convenient',
  'q.magnitudeProduct.s1none': 'Both factors are already convenient, nothing to round',
  'q.magnitudeProduct.s2': '{a1} × {b1} = {approx}',
  'q.magnitudeProduct.s3': 'Correct for the rounding → ≈ {result}',

  'q.marketShare.s1': '1% of the market is {market} / 100 = {anchor}',
  'q.marketShare.s2': 'How many times does {anchor} fit into {client}? {mult} times',
  'q.marketShare.s3': 'That many points of market share: {result}',

  'q.percentOf.s1': '10% of {n} = {anchor}',
  'q.percentOf.s2': '{p} is {mult} times 10%',
  'q.percentOf.s3': '{anchor} × {mult} = {result}',

  'q.percentChange.s1': 'Absolute gap: {to} − {from} = {delta}',
  'q.percentChange.s2': 'Relate it to the base: 1% of {from} = {onePct}',
  'q.percentChange.s3': '{delta} / {onePct} ≈ {result}',

  'q.growthApply.s1': 'Linearly, {r} for {y} years would give {linear}',
  'q.growthApply.s2': 'Compounding adds a little: {compound} in total, so ×{factor}',
  'q.growthApply.s3': '{base} × {factor} ≈ {result}',

  'q.cagr.s1': 'From {from} to {to} is ×{ratio}',
  'q.cagr.s2': 'Anchor: doubling in {y} years needs 72 / {y} ≈ {r72}',
  'q.cagr.s3.plus': 'Here ×{ratio}, more than a doubling: so above {r72}, ≈ {result}',
  'q.cagr.s3.moins': 'Here ×{ratio}, less than a doubling: so below {r72}, ≈ {result}',
  'q.cagr.s3.environ': 'Here ×{ratio}, about a doubling: ≈ {result}',

  'q.margin.s1': 'Gross margin: {rev} × {gm} = {gross}',
  'q.margin.s2': 'Remove fixed costs: {gross} − {fixed}',
  'q.margin.s3': 'Operating profit ≈ {result}',

  'q.breakeven.s1': 'You must cover {fixedK} of fixed costs',
  'q.breakeven.s2': 'Each unit sold brings in {um}',
  'q.breakeven.s3': '{fixedK} / {um} ≈ {result}',

  'q.perUnit.s1': 'Bring both to the same scale: {num} over {den}',
  'q.perUnit.s2': '{num} / {den} ≈ {result}',
  'q.perUnit.s3': 'That is {result} per customer',

  'q.weightedMean.s1': 'Weight each segment: {w1} × {p1} = {c1}, and so on',
  'q.weightedMean.s2_2': '{c1} + {c2}',
  'q.weightedMean.s2_3': '{c1} + {c2} + {c3}',
  'q.weightedMean.s2_4': '{c1} + {c2} + {c3} + {c4}',
  'q.weightedMean.s3': 'Average price ≈ {result}',

  'q.fractions.toPct.s1': 'Anchor worth knowing: 1/{d} = {unit}',
  'q.fractions.toPct.s2': '{f} = {n} × {unit} = {result}',
  'q.fractions.toFrac.s1': 'Anchor worth knowing: 1/{d} = {unit}',
  'q.fractions.toFrac.s2': '{p} / {unit} = {n}',
  'q.fractions.toFrac.s3': 'So {result}',

  'q.marketSizing.s1': 'Population concerned: {pop} × {share} = {users}',
  'q.marketSizing.s2': 'Annual volume: {users} × {freq} = {volume}',
  'q.marketSizing.s3': 'Value: {volume} × {price} ≈ {result}',

}
