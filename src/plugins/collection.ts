import { wankidb } from '@/plugins/wankidb/db'

export async function cardDeckConfig(
  card: Record<string, unknown>,
  dynamicDeck = false,
): Promise<Record<string, unknown>> {
  return deckConfig(card[dynamicDeck ? 'odid' : 'did'] as number)
}

export async function deckConfig(
  deckId: number,
): Promise<Record<string, unknown>> {
  deckId = +deckId || 1
  const deck = await wankidb.decks.get({ id: deckId })
  if (!deck) {
    throw new Error('Deck not found: ' + deckId)
  }

  const configId = +(deck.conf || 1)

  return wankidb.dconf.get({ id: configId }) as Promise<Record<string, unknown>>
}

export async function getCol(): Promise<Record<string, unknown>> {
  return wankidb.col.get({ id: 1 }) as Promise<Record<string, unknown>>
}

export async function getColKey<T>(
  key?: string,
  fallback?: T,
): Promise<T | Record<string, unknown>> {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return fallback as T
  }
  return key ? ((col[key] ?? fallback) as T) : (col as Record<string, unknown>)
}

export async function creationTimestamp(): Promise<number> {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return new Date().getTime()
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
  const conf = col.conf as Record<string, unknown>
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

  const conf = col.conf as Record<string, unknown>
  conf[key] = value

  // Assuming there's a save method on the col object
  return (col as any).save()
}

export function getDecks(): Promise<Record<string, unknown>[]> {
  return wankidb.decks.toArray() as Promise<Record<string, unknown>[]>
}
