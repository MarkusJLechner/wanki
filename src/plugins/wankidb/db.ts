import Dexie from 'dexie'
import 'dexie-observable'
import 'dexie-syncable'
// import './dbSync'
import { Configuration } from '@/plugins/wankidb/types'
import { isObject } from 'plugins/utils.ts'

export const databaseName = 'wankidb'

export type DatabaseNameType =
  | 'cards'
  | 'col'
  | 'tags'
  | 'graves'
  | 'notes'
  | 'revlog'
  | 'media'
  | 'dconf'
  | 'models'
  | 'decks'

export interface BaseTableType extends Record<string, unknown> {
  load: (get: Record<string, string | number>) => Promise<void>
  save: () => Promise<void>
}
// Define interfaces for each table
export interface CardTableType /* extends BaseTableType */ {
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

export interface ColTableType /* extends BaseTableType */ {
  id?: number
  crt?: number
  mod?: number
  scm?: number
  ver?: number
  dty?: number
  usn?: number
  ls?: number
  conf?: Configuration
}

export interface TagTableType /* extends BaseTableType */ {
  id?: number
  tag?: string[]
}

export interface GraveTableType /* extends BaseTableType */ {
  usn?: number
  oid?: number
  type?: number
}

export interface NoteTableType /* extends BaseTableType */ {
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

export interface RevlogTableType /* extends BaseTableType */ {
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

export interface MediaTableType /* extends BaseTableType */ {
  name?: string
}

export interface DconfLapse {
  delays?: number[]
  leechAction?: number
  leechFails?: number
  minInt?: number
  mult?: number
}

export interface DconfRev {
  bury?: boolean
  ease4?: number
  fuzz?: number
  ivlFct?: number
  maxIvl?: number
  minSpace?: number
  perDay?: number
}

export interface DconfNew {
  bury?: boolean
  delays?: number[]
  initialFactor?: number
  ints?: number[]
  order?: number
  perDay?: number
  separate?: boolean
}

export interface DconfTableType /* extends BaseTableType */ {
  id?: number
  name?: string
  autoplay?: boolean
  dyn?: number
  lapse?: DconfLapse
  maxTaken?: number
  mod?: number
  replayq?: boolean
  rev?: DconfRev
  timer?: number
  usn?: number
  new?: DconfNew
}

export interface ModelTableType /* extends BaseTableType */ {
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

export interface DeckTableType /* extends BaseTableType */ {
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

export class WankiDexie extends Dexie {
  cards!: Dexie.Table<CardTableType & BaseTableType, number, CardTableType>
  col!: Dexie.Table<ColTableType & BaseTableType, number, ColTableType>
  tags!: Dexie.Table<TagTableType & BaseTableType, number, TagTableType>
  graves!: Dexie.Table<GraveTableType & BaseTableType, number, GraveTableType>
  notes!: Dexie.Table<NoteTableType & BaseTableType, number, NoteTableType>
  revlog!: Dexie.Table<RevlogTableType & BaseTableType, number, RevlogTableType>
  media!: Dexie.Table<MediaTableType & BaseTableType, string, MediaTableType>
  dconf!: Dexie.Table<DconfTableType & BaseTableType, number, DconfTableType>
  models!: Dexie.Table<ModelTableType & BaseTableType, number, ModelTableType>
  decks!: Dexie.Table<DeckTableType & BaseTableType, number, DeckTableType>

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
  void db.open()
  return db
})()

export const initSync = (): void => {
  wankidb
    .open()
    .then(() => {
      // wankidb.syncable.connect('websocket', 'ws://localhost:3344')
      // wankidb.syncable.on('statusChanged', function (newStatus: number) {
      //   try {
      //     // @ts-expect-error - Syncable is added by dexie-syncable plugin
      //     const status = Dexie.Syncable.StatusTexts[newStatus]
      //     console.log('Sync Status changed: ' + status)
      //   } catch {
      //     console.log('status error')
      //   }
      // })
      console.log('wankidb ws connect')
    })
    .catch((err) => {
      console.error('Failed to open wankidb', err)
    })
}

// initSync()

export const wipeDatabase = (): Promise<void> => {
  return Dexie.delete(databaseName)
}

export type Primitive = string | boolean | number | null | undefined

export type SetParams<T extends BaseTableType> = {
  value?: Primitive
  model: Dexie.Table<T, number, T>
  column: keyof T
  where: Parameters<Dexie.Table<T, number, T>['get']>[0]
  jsonKey?: string
  fallback?: Primitive
  toggle?: boolean
}

export async function set<T extends BaseTableType>({
  value,
  model,
  column,
  where,
  jsonKey,
  fallback,
  toggle,
}: SetParams<T>): Promise<T> {
  let obj = await model.get(where)

  if (!obj) {
    obj = (typeof where === 'object' ? { ...where } : { id: where }) as T
    if (jsonKey) {
      obj[column] = { [jsonKey]: fallback } as T[typeof column]
    }
    await model.put(obj)
  }

  if (jsonKey) {
    const base = obj[column]
    if (!isObject(base)) {
      obj[column] = { [jsonKey]: fallback } as T[typeof column]
    }

    if (toggle) {
      const current = (obj[column] as Record<string, unknown>)[jsonKey]
      ;(obj[column] as Record<string, unknown>)[jsonKey] = !current
    } else if (value !== undefined) {
      ;(obj[column] as Record<string, unknown>)[jsonKey] = value
    }
  } else {
    if (obj[column] === undefined) {
      obj[column] = fallback as T[typeof column]
    }

    if (toggle) {
      const current = obj[column] as unknown
      obj[column] = !current as unknown as T[typeof column]
    } else if (value !== undefined) {
      obj[column] = value as T[typeof column]
    }
  }

  if (typeof obj.save === 'function') {
    await obj.save()
  }

  return obj
}
