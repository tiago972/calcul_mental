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
  'feedback.path': 'Raisonnement',
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
  'stats.reset.help': 'Séries, temps, niveaux et enregistrements. Les réglages sont conservés.',
  'stats.resetConfirm': 'Effacer définitivement tout l’historique ?',
  'stats.resetDone': 'Historique effacé.',

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

  'q.marketShare.prompt':
    'Sur un marché de {market}, le client réalise {client}. Quelle part de marché ?',

  'q.percentOf.prompt': '{p} de {n}',

  'q.percentChange.prompt': 'De {from} à {to}, quelle variation ?',

  'q.growthApply.prompt': '{base} qui croît de {r} par an pendant {y} ans. Quel montant ?',

  'q.cagr.prompt': 'De {from} à {to} en {y} ans. Quel taux annuel moyen ?',

  'q.margin.prompt':
    'CA {rev}, marge brute {gm}, coûts fixes {fixed}. Quel résultat d’exploitation ?',

  'q.breakeven.prompt':
    'Coûts fixes {fixed}, marge unitaire {um}. Quel volume pour atteindre l’équilibre ?',

  'q.perUnit.prompt': '{total} répartis sur {cust} clients. Combien par client ?',

  'q.weightedMean.prompt2': '2 segments : {w1} à {p1}, {w2} à {p2}. Prix moyen ?',
  'q.weightedMean.prompt3':
    '3 segments : {w1} à {p1}, {w2} à {p2}, {w3} à {p3}. Prix moyen ?',
  'q.weightedMean.prompt4':
    '4 segments : {w1} à {p1}, {w2} à {p2}, {w3} à {p3}, {w4} à {p4}. Prix moyen ?',

  'q.fractions.promptToPct': '{f} en pourcentage',
  'q.fractions.promptToFrac': '{p} en fraction',

  'q.marketSizing.prompt':
    'Population {pop}, {share} concernés, fréquence d’achat {freq} par an, {price} l’unité. Quelle taille de marché ?',

  // — Étapes de raisonnement ————————————————————————————————————
  'q.magnitudeProduct.s1': 'Simplifier les deux : {a} ≈ {a1}, {b} ≈ {b1}',
  'q.magnitudeProduct.s1a': 'Simplifier {a} ≈ {a1} ; {b} est déjà commode',
  'q.magnitudeProduct.s1b': 'Simplifier {b} ≈ {b1} ; {a} est déjà commode',
  'q.magnitudeProduct.s1none': 'Les deux facteurs sont déjà commodes, rien à arrondir',
  'q.magnitudeProduct.s2': '{a1} × {b1} = {approx}',
  'q.magnitudeProduct.s3': 'Rattraper l’arrondi → ≈ {result}',

  'q.marketShare.s1': '1 % du marché, c’est {market} / 100 = {anchor}',
  'q.marketShare.s2': 'Combien de fois {anchor} tient dans {client} ? {mult} fois',
  'q.marketShare.s3': 'Autant de points de part de marché : {result}',

  'q.percentOf.s1': '10 % de {n} = {anchor}',
  'q.percentOf.s2': '{p}, c’est {mult} fois 10 %',
  'q.percentOf.s3': '{anchor} × {mult} = {result}',

  'q.percentChange.s1': 'Écart absolu : {to} − {from} = {delta}',
  'q.percentChange.s2': 'Le rapporter à la base : 1 % de {from} = {onePct}',
  'q.percentChange.s3': '{delta} / {onePct} ≈ {result}',

  'q.growthApply.s1': 'En linéaire, {r} pendant {y} ans ferait {linear}',
  'q.growthApply.s2': 'La composition ajoute un peu : {compound} au total, soit ×{factor}',
  'q.growthApply.s3': '{base} × {factor} ≈ {result}',

  'q.cagr.s1': 'De {from} à {to}, c’est ×{ratio}',
  'q.cagr.s2': 'Repère : doubler en {y} ans demande 72 / {y} ≈ {r72}',
  'q.cagr.s3.plus': 'Ici ×{ratio}, plus qu’un doublement : donc au-dessus de {r72}, ≈ {result}',
  'q.cagr.s3.moins': 'Ici ×{ratio}, moins qu’un doublement : donc en dessous de {r72}, ≈ {result}',
  'q.cagr.s3.environ': 'Ici ×{ratio}, soit environ un doublement : ≈ {result}',

  'q.margin.s1': 'Marge brute : {rev} × {gm} = {gross}',
  'q.margin.s2': 'Retirer les coûts fixes : {gross} − {fixed}',
  'q.margin.s3': 'Résultat d’exploitation ≈ {result}',

  'q.breakeven.s1': 'Il faut couvrir {fixedK} de coûts fixes',
  'q.breakeven.s2': 'Chaque unité vendue en rapporte {um}',
  'q.breakeven.s3': '{fixedK} / {um} ≈ {result}',

  'q.perUnit.s1': 'Ramener les deux à la même échelle : {num} pour {den}',
  'q.perUnit.s2': '{num} / {den} ≈ {result}',
  'q.perUnit.s3': 'Soit {result} par client',

  'q.weightedMean.s1': 'Pondérer chaque segment : {w1} × {p1} = {c1}, et ainsi de suite',
  'q.weightedMean.s2_2': '{c1} + {c2}',
  'q.weightedMean.s2_3': '{c1} + {c2} + {c3}',
  'q.weightedMean.s2_4': '{c1} + {c2} + {c3} + {c4}',
  'q.weightedMean.s3': 'Prix moyen ≈ {result}',

  'q.fractions.toPct.s1': 'Repère à connaître : 1/{d} = {unit}',
  'q.fractions.toPct.s2': '{f} = {n} × {unit} = {result}',
  'q.fractions.toFrac.s1': 'Repère à connaître : 1/{d} = {unit}',
  'q.fractions.toFrac.s2': '{p} / {unit} = {n}',
  'q.fractions.toFrac.s3': 'Donc {result}',

  'q.marketSizing.s1': 'Population concernée : {pop} × {share} = {users}',
  'q.marketSizing.s2': 'Volume annuel : {users} × {freq} = {volume}',
  'q.marketSizing.s3': 'Valeur : {volume} × {price} ≈ {result}',

} as const

export type Key = keyof typeof fr
