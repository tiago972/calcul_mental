/*
 * Service worker écrit à la main : pas de plugin, pas de liste d'actifs à
 * tenir à jour soi-même. `scripts/sw-assets.mjs` remplit ASSETS et BUILD après
 * `vite build`. Aucune donnée ne sort de l'appareil — ce fichier n'émet aucune
 * requête vers un tiers.
 */

/* Remplacés au build. Sans cette étape le worker reste fonctionnel, il met
   simplement les actifs en cache au fil des requêtes plutôt qu'à l'install. */
const BUILD = 'dev'
const ASSETS = []

const CACHE = `calcul-mental-${BUILD}`
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  ...ASSETS,
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/**
 * Toute écriture en cache passe par `waitUntil` : sans cela le worker peut
 * être arrêté avant la fin du `put`, et l'actif manque au prochain démarrage
 * hors ligne — de façon intermittente, donc difficile à voir.
 */
function keep(e, req, res) {
  const copy = res.clone()
  e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)))
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // Navigation : réseau d'abord pour récupérer une nouvelle version, index.html sinon.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) keep(e, './index.html', res)
          return res
        })
        .catch(() =>
          caches.match('./index.html').then((r) => r || caches.match('./').then((x) => x || Response.error())),
        ),
    )
    return
  }

  // Actifs versionnés par Vite : le cache fait foi, il ne peut pas être périmé.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) keep(e, req, res)
          return res
        }),
    ),
  )
})
