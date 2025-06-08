import { wankidb } from '@/plugins/wankidb/db'
import type { ColTableType, DconfTableType } from '@/plugins/wankidb/db'
import { now } from '@/plugins/time'
import { toRaw } from 'vue'

export async function cardDeckConfig(
  card: unknown,
  dynamicDeck = false,
): Promise<DconfTableType> {
  const deckId = (card as { did?: number; odid?: number })[
    dynamicDeck ? 'odid' : 'did'
  ]
  return deckConfig(deckId as number)
}

export async function deckConfig(deckId: number): Promise<DconfTableType> {
  deckId = +deckId || 1
  const deck = await wankidb.decks.get({ id: deckId })
  if (!deck) {
    throw new Error('Deck not found: ' + deckId)
  }

  const configId = +(deck.conf || 1)
  const col = await wankidb.col.get({ id: 1 })
  if (col && col.dconf) {
    const conf = (col.dconf as Record<string, Record<string, unknown>>)[
      String(configId)
    ]
    if (conf) {
      return conf
    }
  }

  return (await wankidb.dconf.get({
    id: configId,
  })) as unknown as DconfTableType
}

export async function getCol(): Promise<Record<string, unknown>> {
  return wankidb.col.get({ id: 1 }) as unknown as Promise<
    Record<string, unknown>
  >
}

export async function getColKey<T>(
  key?: string,
  fallback?: T,
): Promise<T | ColTableType> {
  const col = await wankidb.col.get({ id: 1 })

  if (!col) {
    console.error('No collection found')
    return fallback as T
  }

  return key ? ((col[key as keyof typeof col] ?? fallback) as T) : col
}

export async function creationTimestamp(): Promise<number> {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return now()
  }
  // because crt is in seconds
  return (col.crt as number) * 1000
}

export async function getConf<T>(
  key?: string,
  fallback?: T,
): Promise<T | Record<string, unknown>> {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return fallback as T
  }
  let conf = col.conf as unknown as Record<string, unknown>
  if (typeof conf === 'string') {
    conf = JSON.parse(conf)
  }

  return key ? ((conf[key] ?? fallback) as T) : conf
}

export async function setConf<T>(
  key: string,
  value: T,
): Promise<Record<string, unknown>> {
  const col = await wankidb.col.get({ id: 1 })
  if (!col || !col.conf) {
    throw new Error('No collection found or conf is undefined')
  }

  let conf = col.conf as unknown as Record<string, unknown>
  if (typeof conf === 'string') {
    conf = JSON.parse(conf)
  }
  conf[key] = toRaw(value)

  await col.save()
  return conf
}

export function getDecks(): Promise<Record<string, unknown>[]> {
  return wankidb.decks.toArray() as unknown as Promise<
    Record<string, unknown>[]
  >
}
