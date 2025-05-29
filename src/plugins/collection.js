import { wankidb } from '@/plugins/wankidb/db'

export async function cardDeckConfig(card, dynamicDeck = false) {
  return deckConfig(card[dynamicDeck ? 'odid' : 'did'])
}

export async function deckConfig(deckId) {
  deckId = +deckId || 1
  const deck = wankidb.decks.get({ id: deckId })
  if (!deck) {
    throw new Error('Deck not found: ' + deckId)
  }

  const configId = +deck.conf || 1

  return wankidb.dconf.get({ id: configId })
}

export async function getCol() {
  return wankidb.col.get({ id: 1 })
}

export async function getColKey(key, fallback) {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return fallback
  }
  return key ? (col[key] ?? fallback) : col
}

export async function creationTimestamp() {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return new Date().getTime()
  }
  // because crt is in seconds
  return col.crt * 1000
}

export async function getConf(key, fallback) {
  const col = await wankidb.col.get({ id: 1 })
  if (!col) {
    console.error('No collection found')
    return fallback
  }
  const conf = col.conf
  return key ? (conf[key] ?? fallback) : conf
}

export async function setConf(key, value) {
  const col = await wankidb.col.get({ id: 1 })
  col.conf[key] = value
  return col.save()
}

export function getDecks() {
  return wankidb.decks.toArray()
}
