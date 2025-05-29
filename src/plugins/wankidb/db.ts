import Dexie from 'dexie'
// import 'dexie-observable'
// import 'dexie-syncable'
// import './dbSync'

export const databaseName = 'wankidb'

// Define interfaces for each table
interface Card {
  id?: number
  nid?: number
  did?: number
  ord?: number
  mod?: number
  usn?: number
  type?: number
  queue?: number
  due?: number
  ivl?: number
  factor?: number
  reps?: number
  lapses?: number
  left?: number
  odue?: number
  odid?: number
  flags?: number
  data?: string
}

interface Col {
  id?: number
  crt?: number
  mod?: number
  scm?: number
  ver?: number
  dty?: number
  usn?: number
  ls?: number
  conf?: Record<string, unknown>
}

interface Tag {
  id?: number
  tag?: string[]
}

interface Grave {
  usn?: number
  oid?: number
  type?: number
}

interface Note {
  id?: number
  guid?: string
  mid?: number
  mod?: number
  usn?: number
  tags?: string
  flds?: string
  sfld?: string
  csum?: number
  flags?: number
  data?: string
}

interface Revlog {
  id?: number
  cid?: number
  usn?: number
  ease?: number
  ivl?: number
  lastIvl?: number
  factor?: number
  time?: number
  type?: number
}

interface Media {
  name?: string
}

interface Dconf {
  id?: number
  name?: string
  replayq?: boolean
  lapse?: Record<string, unknown>
  rev?: Record<string, unknown>
  timer?: number
  maxTaken?: number
  usn?: number
  new?: Record<string, unknown>
  mod?: number
  autoplay?: boolean
}

interface Model {
  id?: number
  vers?: number
  name?: string
  tags?: string
  did?: number
  usn?: number
  req?: Record<string, unknown>
  flds?: Record<string, unknown>
  sortf?: number
  tmpls?: Record<string, unknown>
  mod?: number
  latexPost?: string
  type?: number
  css?: string
  latexPre?: string
}

interface Deck {
  id?: number
  terms?: Record<string, unknown>
  separate?: boolean
  collapsed?: boolean
  newToday?: number[]
  timeToday?: number[]
  dyn?: number
  conf?: number
  return?: boolean
  revToday?: number[]
  lrnToday?: number[]
  mod?: number
  name?: string
  usn?: number
  delays?: number[]
  resched?: boolean
  desc?: string
}

// Extend Dexie with our tables
class WankiDexie extends Dexie {
  cards!: Dexie.Table<Card, number>
  col!: Dexie.Table<Col, number>
  tags!: Dexie.Table<Tag, number>
  graves!: Dexie.Table<Grave, number>
  notes!: Dexie.Table<Note, number>
  revlog!: Dexie.Table<Revlog, number>
  media!: Dexie.Table<Media, string>
  dconf!: Dexie.Table<Dconf, number>
  models!: Dexie.Table<Model, number>
  decks!: Dexie.Table<Deck, number>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      cards:
        'id,nid,did,ord,mod,usn,type,queue,due,ivl,factor,reps,lapses,left,odue,odid,flags,data,[did+queue+due]',
      col: 'id,crt,mod,scm,ver,dty,usn,ls,conf',
      tags: '++id,*tag',
      graves: 'usn,oid,type',
      notes: 'id,guid,mid,mod,usn,tags,flds,sfld,csum,flags,data',
      revlog: 'id,cid,usn,ease,ivl,lastIvl,factor,time,type',
      media: 'name',
      dconf: 'id,name,replayq,lapse,rev,timer,maxTaken,usn,new,mod,id,autoplay',
      models:
        'id,vers,name,tags,did,usn,req,flds,sortf,tmpls,mod,latexPost,type,id,css,latexPre',
      decks:
        'id,terms,separate,collapsed,newToday,timeToday,dyn,conf,return,revToday,lrnToday,id,mod,name,usn,delays,resched,desc',
    })
  }
}

export const wankidb = (() => {
  const db = new WankiDexie(databaseName)
  db.open()
  return db
})()

export const initSync = (): void => {
  wankidb.open().then(() => {
    // @ts-expect-error - Syncable is added by dexie-syncable plugin
    wankidb.syncable.connect('websocket', 'ws://localhost:3344')
    // @ts-expect-error - Syncable is added by dexie-syncable plugin
    wankidb.syncable.on('statusChanged', function (newStatus: number) {
      try {
        // @ts-expect-error - Syncable is added by dexie-syncable plugin
        const status = Dexie.Syncable.StatusTexts[newStatus]
        console.log('Sync Status changed: ' + status)
      } catch {
        console.log('status error')
      }
    })
    console.log('wankidb ws connect')
  })
}

// initSync()

export const wipeDatabase = (): Promise<void> => {
  return Dexie.delete(databaseName)
}
