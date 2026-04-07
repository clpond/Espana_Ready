// Storage abstraction: uses Vercel KV in production, in-memory fallback for local dev
// In production, set KV_REST_API_URL and KV_REST_API_TOKEN env vars

let kv = null

async function getKV() {
  if (kv) return kv
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { createClient } = await import('@vercel/kv')
    kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    return kv
  }
  // In-memory fallback for local development
  const store = {}
  kv = {
    get: async (key) => store[key] ?? null,
    set: async (key, value, opts) => { store[key] = value },
    hset: async (key, obj) => {
      if (!store[key]) store[key] = {}
      Object.assign(store[key], obj)
    },
    hgetall: async (key) => store[key] ?? null,
    hget: async (key, field) => (store[key] ?? {})[field] ?? null,
    zadd: async (key, ...args) => {
      if (!store[key]) store[key] = []
      // args: { score, member } or score, member
      for (let i = 0; i < args.length; i++) {
        const { score, member } = args[i]
        const idx = store[key].findIndex(e => e.member === member)
        if (idx >= 0) store[key][idx].score = score
        else store[key].push({ score, member })
      }
    },
    zrange: async (key, start, stop, opts) => {
      const arr = store[key] ?? []
      const sorted = [...arr].sort((a, b) =>
        opts?.rev ? b.score - a.score : a.score - b.score
      )
      const slice = sorted.slice(start, stop === -1 ? undefined : stop + 1)
      if (opts?.withScores) {
        return slice.flatMap(e => [e.member, e.score])
      }
      return slice.map(e => e.member)
    },
    keys: async (pattern) => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      return Object.keys(store).filter(k => regex.test(k))
    },
    del: async (...keys) => { keys.forEach(k => delete store[k]) },
  }
  return kv
}

export async function storeGet(key) {
  const db = await getKV()
  return db.get(key)
}

export async function storeSet(key, value, opts = {}) {
  const db = await getKV()
  return db.set(key, value, opts)
}

export async function storeHSet(key, obj) {
  const db = await getKV()
  return db.hset(key, obj)
}

export async function storeHGetAll(key) {
  const db = await getKV()
  return db.hgetall(key)
}

export async function storeHGet(key, field) {
  const db = await getKV()
  return db.hget(key, field)
}

export async function storeZAdd(key, score, member) {
  const db = await getKV()
  return db.zadd(key, { score, member })
}

export async function storeZRange(key, start, stop, opts = {}) {
  const db = await getKV()
  return db.zrange(key, start, stop, opts)
}

export async function storeKeys(pattern) {
  const db = await getKV()
  return db.keys(pattern)
}
