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

console.log(deckConfig)
