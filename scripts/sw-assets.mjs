/*
 * Après `vite build` : injecte dans dist/sw.js la liste des actifs versionnés
 * et un identifiant de build. Sans cette étape le hors-ligne ne fonctionne
 * qu'à partir de la deuxième visite ; avec, dès la première.
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const SW = join(DIST, 'sw.js')

const assets = readdirSync(join(DIST, 'assets'))
  .filter((f) => /\.(js|css|woff2?)$/.test(f))
  .sort()
  .map((f) => `./assets/${f}`)

if (assets.length === 0) {
  console.error('sw-assets : aucun actif trouvé dans dist/assets — build incomplet ?')
  process.exit(1)
}

// Le nom du cache change à chaque build : l'ancien est supprimé à l'activation.
const build = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 12)

let sw = readFileSync(SW, 'utf8')
const before = sw
sw = sw
  .replace(/^const BUILD = '.*'$/m, `const BUILD = '${build}'`)
  .replace(/^const ASSETS = \[\]$/m, `const ASSETS = ${JSON.stringify(assets)}`)

if (sw === before) {
  console.error('sw-assets : les repères BUILD/ASSETS sont introuvables dans dist/sw.js')
  process.exit(1)
}

writeFileSync(SW, sw)
console.log(`sw-assets : build ${build}, ${assets.length} actifs précachés`)
