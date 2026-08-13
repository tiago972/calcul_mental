/**
 * Enregistrement local de la verbalisation. Les blobs vont dans IndexedDB —
 * `localStorage` ne stocke que du texte — et n'en sortent jamais : aucune
 * requête réseau n'est émise par ce module.
 */

const DB = 'cm-audio'
const STORE = 'clips'
export const MAX_CLIPS = 30

export type Clip = { id: number; blob: Blob; typeId: string }

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
        t.oncomplete = () => db.close()
      }),
  )
}

export async function putClip(clip: Clip): Promise<void> {
  await tx('readwrite', (s) => s.put(clip))
  const all = await listClips()
  // Purge du plus ancien : l'entraînement quotidien ne doit pas remplir le disque.
  for (const c of all.slice(0, Math.max(0, all.length - MAX_CLIPS))) {
    await tx('readwrite', (s) => s.delete(c.id))
  }
}

export async function listClips(): Promise<Clip[]> {
  try {
    const all = await tx<Clip[]>('readonly', (s) => s.getAll() as IDBRequest<Clip[]>)
    return all.sort((a, b) => a.id - b.id)
  } catch {
    return []
  }
}

export async function clearClips(): Promise<void> {
  try {
    await tx('readwrite', (s) => s.clear())
  } catch {
    /* rien à faire */
  }
}

export type Recorder = { stop: () => Promise<Blob | null> }

/** Renvoie null si le micro est refusé ou indisponible — jamais d'exception. */
export async function startRecording(): Promise<Recorder | null> {
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices) return null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const rec = new MediaRecorder(stream)
    const chunks: BlobPart[] = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    rec.start()
    return {
      stop: () =>
        new Promise<Blob | null>((resolve) => {
          rec.onstop = () => {
            stream.getTracks().forEach((t) => t.stop())
            resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : null)
          }
          rec.stop()
        }),
    }
  } catch {
    return null
  }
}
