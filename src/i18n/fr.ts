export const fr = {
  'app.title': 'Calcul de cas',

  // — Accueil ————————————————————————————————————————————————
  'home.start': 'Commencer',
  'home.streak.one': 'jour d’affilée',
  'home.streak.many': 'jours d’affilée',
  'home.streak.none': 'Première séance',
  'home.stats': 'Statistiques',
  'home.settings': 'Réglages',
  'home.duration': '3 blocs de 5 minutes',

  // — Séance ————————————————————————————————————————————————
  'session.block': 'Bloc {n} sur {total}',
  'session.pause': 'Pause',
  'session.pause.hint': 'Respire. Le bloc suivant démarre tout seul.',
  'session.pause.skip': 'Enchaîner maintenant',
  'session.dontKnow': 'Je ne sais pas',
  'session.validate': 'Valider',
  'session.speak': 'Dis ton raisonnement à voix haute',
  'session.speak.go': 'Vas-y',
  'session.quit': 'Arrêter la séance',

  // — Retour après réponse ————————————————————————————————————
  'feedback.correct': 'Juste',
  'feedback.incorrect': 'Faux',
  'feedback.late': 'Juste, mais hors délai',
  'feedback.skipped': 'Passée',
  'feedback.expected': 'Réponse attendue',
  'feedback.exact': 'Valeur exacte',
  'feedback.path': 'Chemin',
  'feedback.time': 'Temps',
  'feedback.next': 'Toucher pour continuer',

  // — Fin de séance ——————————————————————————————————————————
  'summary.title': 'Séance terminée',
  'summary.median': 'Temps médian',
  'summary.rate': 'Réussite',
  'summary.count': '{n} questions',
  'summary.weakest': 'À retravailler',
  'summary.advice': 'Demain',
  'summary.home': 'Retour',
  'advice.slow':
    'Tu es juste mais lent : demain, force-toi à poser un ordre de grandeur avant de calculer.',
  'advice.rushed':
    'Tu vas vite mais tu manques la cible : demain, arrondis moins brutalement, à deux chiffres significatifs.',
  'advice.weakType': 'Demain, commence par {type} : c’est là que tu perds le plus de temps.',
  'advice.good': 'Rien à corriger aujourd’hui. Reviens demain, la régularité fait le reste.',
  'advice.empty': 'Séance trop courte pour conclure. Reviens demain.',

  // — Statistiques ————————————————————————————————————————————
  'stats.title': 'Statistiques',
  'stats.streak': 'Série',
  'stats.days.one': 'jour',
  'stats.days.many': 'jours',
  'stats.byType': 'Par type',
  'stats.type': 'Type',
  'stats.rate': 'Réussite',
  'stats.median': 'Médiane',
  'stats.level': 'Niveau',
  'stats.trend': '30 j',
  'stats.medianCurve': 'Temps médian par séance',
  'stats.none': 'Aucune donnée. Fais une première séance.',
  'stats.export': 'Exporter (JSON)',
  'stats.import': 'Importer',
  'stats.importOk': 'Historique importé.',
  'stats.importFail': 'Fichier illisible : rien n’a été modifié.',
  'stats.reset': 'Tout effacer',
  'stats.resetConfirm': 'Effacer définitivement tout l’historique ?',

  // — Réglages ————————————————————————————————————————————————
  'settings.title': 'Réglages',
  'settings.lang': 'Langue',
  'settings.target': 'Cible de temps par question',
  'settings.feedback': 'Temps de lecture de la correction',
  'settings.feedback.manual': 'au tap',
  'settings.verbalize': 'Mode verbalisation',
  'settings.verbalize.help':
    'Trois secondes avant chaque question pour dire le raisonnement à voix haute.',
  'settings.audio': 'Enregistrer la verbalisation',
  'settings.audio.help':
    'L’audio reste sur cet appareil, dans le navigateur. Rien n’est envoyé nulle part.',
  'settings.audio.denied': 'Micro refusé : l’enregistrement reste désactivé.',
  'settings.sound': 'Bip du chrono',
  'settings.back': 'Retour',
  'settings.recordings': 'Enregistrements',
  'settings.recordings.none': 'Aucun enregistrement.',
  'settings.recordings.clear': 'Effacer les enregistrements',

  // — Unité de réponse attendue ————————————————————————————————
  'answer.hint.percent': 'réponse en %',
  'answer.hint.fraction': 'réponse en fraction, ex. 3/8',
  'answer.hint.money.unit': 'réponse en €',
  'answer.hint.money.k': 'réponse en k€',
  'answer.hint.money.M': 'réponse en M€',
  'answer.hint.money.Md': 'réponse en Md€',
  'answer.hint.count.unit': 'réponse en unités',
  'answer.hint.count.k': 'réponse en milliers d’unités',
  'answer.hint.count.M': 'réponse en millions d’unités',
  'answer.hint.count.Md': 'réponse en milliards d’unités',
  'answer.hint.plain.unit': 'réponse en nombre',
  'answer.hint.plain.k': 'réponse en milliers',
  'answer.hint.plain.M': 'réponse en millions',
  'answer.hint.plain.Md': 'réponse en milliards',

  // — Noms des types ——————————————————————————————————————————
  'type.magnitudeProduct': 'Ordres de grandeur',
  'type.marketShare': 'Part de marché',
  'type.percentOf': 'Pourcentage d’un nombre',
  'type.percentChange': 'Variation',
  'type.growthApply': 'Croissance appliquée',
  'type.cagr': 'TCAM',
  'type.margin': 'Marge et résultat',
  'type.breakeven': 'Seuil de rentabilité',
  'type.perUnit': 'Ramener à l’unité',
  'type.weightedMean': 'Moyenne pondérée',
  'type.fractions': 'Fractions',
  'type.marketSizing': 'Dimensionnement',

  // — Énoncés et chemins de calcul ——————————————————————————————
  'q.magnitudeProduct.prompt': '{a} × {b}',
  'q.magnitudeProduct.path': '{a} × {b} ≈ {a1} × {b1} = {approx}, ajusté ≈ {result}',

  'q.marketShare.prompt':
    'Sur un marché de {market}, le client réalise {client}. Quelle part de marché ?',
  'q.marketShare.path': '1 % de {market} = {anchor} ; {client} / {anchor} = {mult} → {result}',

  'q.percentOf.prompt': '{p} de {n}',
  'q.percentOf.path': '10 % de {n} = {anchor} ; × {mult} ≈ {result}',

  'q.percentChange.prompt': 'De {from} à {to}, quelle variation ?',
  'q.percentChange.path': '{to} − {from} = {delta} ; {delta} / {from} ≈ {result}',

  'q.growthApply.prompt': '{base} qui croît de {r} par an pendant {y} ans. Quel montant ?',
  'q.growthApply.path':
    '{r} × {y} ans ≈ {linear} en linéaire, {compound} en composé → {base} × ce facteur ≈ {result}',

  'q.cagr.prompt': 'De {from} à {to} en {y} ans. Quel taux annuel moyen ?',
  'q.cagr.path': '× {ratio} en {y} ans ; repère : doubler en {y} ans ≈ {r72} → ≈ {result}',

  'q.margin.prompt':
    'CA {rev}, marge brute {gm}, coûts fixes {fixed}. Quel résultat d’exploitation ?',
  'q.margin.path': '{rev} × {gm} ≈ {gross} ; {gross} − {fixed} ≈ {result}',

  'q.breakeven.prompt':
    'Coûts fixes {fixed}, marge unitaire {um}. Quel volume pour atteindre l’équilibre ?',
  'q.breakeven.path': '{fixedK} / {um} ≈ {result}',

  'q.perUnit.prompt': '{total} répartis sur {cust} clients. Combien par client ?',
  'q.perUnit.path': '{total} / {cust} → {num} / {den} ≈ {result}',

  'q.weightedMean.prompt2': '2 segments : {w1} à {p1}, {w2} à {p2}. Prix moyen ?',
  'q.weightedMean.path2': '{c1} + {c2} ≈ {result}',
  'q.weightedMean.prompt3':
    '3 segments : {w1} à {p1}, {w2} à {p2}, {w3} à {p3}. Prix moyen ?',
  'q.weightedMean.path3': '{c1} + {c2} + {c3} ≈ {result}',
  'q.weightedMean.prompt4':
    '4 segments : {w1} à {p1}, {w2} à {p2}, {w3} à {p3}, {w4} à {p4}. Prix moyen ?',
  'q.weightedMean.path4': '{c1} + {c2} + {c3} + {c4} ≈ {result}',

  'q.fractions.promptToPct': '{f} en pourcentage',
  'q.fractions.pathToPct': '{f} = {n} × {unit} = {result}',
  'q.fractions.promptToFrac': '{p} en fraction',
  'q.fractions.pathToFrac': 'Repère : 1/{d} = {unit}. Donc {p} = {result}.',

  'q.marketSizing.prompt':
    'Population {pop}, {share} concernés, fréquence d’achat {freq} par an, {price} l’unité. Quelle taille de marché ?',
  'q.marketSizing.path':
    '{pop} × {share} ≈ {users} ; × {freq} ≈ {volume} ; × {price} ≈ {result}',
} as const

export type Key = keyof typeof fr
