import Dexie from 'dexie'

const dexiedb = new Dexie('wankidb')
dexiedb.version(1).stores({
  tasks: '++id,date,description,done',
  decks: '++id,date,description,done',
})

console.log(dexiedb)

export default dexiedb
