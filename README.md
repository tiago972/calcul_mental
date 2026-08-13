# Calcul de cas

Entraînement quotidien au calcul mental pour les *case interviews*. L'objectif
n'est pas de calculer juste, c'est de **poser un ordre de grandeur en moins de
vingt secondes**. L'application valide dans une tolérance et montre à chaque fois
la réponse arrondie qu'un consultant aurait donnée, plus le chemin en une ligne.

Application web statique, sans backend, installable en PWA. Aucune donnée ne
sort de l'appareil : tout tient dans `localStorage` (et IndexedDB pour les
enregistrements audio facultatifs).

## Installation

```bash
npm install
```

## Lancement

```bash
npm run dev
```

`npm run build` produit `dist/`, `npm run preview` le sert, `npm test` lance la
suite Vitest.

## Une séance

Trois blocs de cinq minutes séparés par trente secondes de pause. Chaque
question a une cible de vingt secondes, réglable. Au-delà de la cible la
question compte comme échouée mais reste répondable — le temps réel est noté.

La correction reste affichée quatre secondes puis passe à la suivante, ou
immédiatement au tap. Réglable : 2 s, 4 s, 6 s, ou uniquement au tap. Le
cahier des charges disait deux secondes, trop court pour lire le chemin de
calcul, qui est la seule chose à retenir de la correction.

Le niveau (1 à 5) est mémorisé **par type d'exercice** : il monte après quatre
bonnes réponses consécutives sous la cible, descend après deux échecs. Un
dépassement de chrono compte comme un échec, c'est le point de l'entraînement.

Les types sont tirés inversement à la réussite récente, avec un plancher de 4 %
chacun. Le cahier des charges demandait 10 %, impossible à douze types
(120 %) : 4 % est la moitié de la part uniforme, soit environ une question de
chaque type toutes les deux séances.

Au clavier : les chiffres saisissent, `Entrée` valide, `Espace` passe.

## Architecture

```
src/core/         pur, sans React, entièrement testé
  types.ts        Question, Num, Tolerance, AnswerSpec
  rng.ts          mulberry32 rejouable — tests déterministes
  numbers.ts      tirage de nombres « de cas », échelles k/M/Md
  tolerance.ts    check() et roundestWithin()
  adaptive.ts     nextLevel()
  sampling.ts     poids par type + tirage
  session.ts      blocs, bilan, conseil du lendemain
  stats.ts        série de jours, médianes, tendance 30 j
  generators/     un fichier par type + index.ts (le registre)
src/store/        schéma persisté, localStorage, réducteur
src/i18n/         fr.ts, en.ts, t()
src/ui/           écrans et composants, formatage localisé
src/audio/        MediaRecorder + IndexedDB, jamais de réseau
src/tests/        Vitest, sur core/ store/ et la saisie
```

**Les générateurs ne produisent pas de texte.** Ils renvoient une clé i18n et des
valeurs typées (`Num`) ; le rendu — séparateurs, unités, `840 M€` contre
`€840M` — se fait dans `src/ui/format.ts`. C'est ce qui rend le bilinguisme
gratuit et testable.

## Ajouter un type d'exercice

Un fichier, une ligne dans le registre, une ligne dans `TYPE_IDS`, deux clés par
langue.

```ts
// src/core/generators/discount.ts
import { businessNumber, money, pct, percentLike, roundSig } from '../numbers'
import { build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

const CFG = [30, 40, 50, 60, 70] as const // remise maximale, par niveau

export const discount: ExerciseType = {
  id: 'discount',
  labelKey: 'type.discount',
  generate(level: Level, rng: Rng) {
    const price = businessNumber(rng, { min: 20, max: 900, sig: 2 })
    const off = percentLike(rng, { min: 5, max: byLevel(level, CFG), step: 5 })
    const exact = price * (1 - off / 100)
    return build({
      typeId: 'discount',
      level,
      prompt: { key: 'q.discount.prompt', vars: { price: money(price), off: pct(off) } },
      path: { key: 'q.discount.path', vars: { off: pct(off), result: money(roundSig(exact, 3)) } },
      exact,
      answer: { style: 'money', scale: 'unit' },
      tolerance: REL(2),
    })
  },
}
```

Puis : `'discount'` dans `TYPE_IDS` (`src/core/types.ts`), `discount` dans
`TYPES` (`src/core/generators/index.ts`), et `type.discount`,
`q.discount.prompt`, `q.discount.path` dans `src/i18n/fr.ts` et `en.ts`.

La suite de tests traite le registre en boucle : le nouveau type est
automatiquement vérifié sur ses plages, sa tolérance, ses clés manquantes et son
rendu dans les deux langues. Aucun test à écrire.

## Données

Clé `cm:v1` dans `localStorage` : réglages, niveaux par type, tentatives
(5 000 dernières), jours travaillés, bilans de séance. Export et import JSON
depuis l'écran Statistiques ; une entrée illisible retombe champ par champ sur
les valeurs par défaut plutôt que d'empêcher l'application de démarrer.

« Tout effacer », en bas de l'écran Statistiques, remet à zéro l'historique,
les niveaux atteints et les enregistrements audio — les réglages sont
conservés. C'est la seule action destructive de l'application : elle est isolée
du reste de l'écran et demande confirmation.

Les enregistrements audio du mode verbalisation vont dans IndexedDB
(`localStorage` ne stocke que du texte), trente au maximum, purgés par les plus
anciens, jamais envoyés nulle part.

## Mise en ligne

`.github/workflows/pages.yml` construit et publie sur GitHub Pages à chaque
poussée sur `main`, après avoir passé la suite de tests. Les chemins sont
relatifs (`base: './'`), l'application fonctionne donc aussi bien à la racine
d'un domaine que dans un sous-dossier de projet — les deux sont vérifiés.

HTTPS est obligatoire : un service worker ne s'enregistre pas en HTTP, et sans
lui il n'y a pas de hors-ligne. Partager le serveur de développement sur le
Wi-Fi local ne suffit donc pas.

Sur iPhone : ouvrir l'adresse dans **Safari**, Partager → Sur l'écran d'accueil.
L'application installée dispose de son propre stockage, indépendant de l'onglet
Safari : l'historique et la série de jours ne sont pas repris du navigateur.
Utiliser l'export/import JSON de l'écran Statistiques pour les transférer.

## Hors ligne

Le service worker (`public/sw.js`) est écrit à la main. `scripts/sw-assets.mjs`,
lancé après `vite build`, y injecte la liste des actifs versionnés et un
identifiant de build — sans quoi le hors-ligne ne marcherait qu'à partir de la
deuxième visite, et le nom du cache ne changerait pas d'un déploiement à
l'autre. Le worker ne s'enregistre qu'en production.

Toute écriture en cache passe par `waitUntil`. Sans cela le worker peut être
arrêté avant la fin du `put` : l'actif manque alors au démarrage hors ligne, de
façon intermittente.

Vérifié en pilotant Firefox headless (WebDriver BiDi), à la racine et depuis un
sous-dossier : après **une seule** visite le worker est `activated` et contrôle
la page, le cache contient le coquillage, le manifeste, les icônes, le JS et le
CSS. Serveur arrêté et réseau confirmé mort, un rechargement affiche
l'application complète, styles compris.

Ce qui n'a pas été vérifié faute de Chrome sur la machine : l'invite
d'installation PWA elle-même, propre à Chrome. Sur iPhone, l'installation passe
de toute façon par Safari → Partager → Sur l'écran d'accueil.
