// This file contains TypeScript interfaces for the JSONObject structures in the col table

// Models JSONObject structure
export interface ModelField {
  font: string
  media: string[]
  name: string
  ord: number
  rtl: boolean
  size: number
  sticky: boolean
}

export interface Template {
  afmt: string
  bafmt: string
  bqfmt: string
  did: number | null
  name: string
  ord: number
  qfmt: string
}

export interface Model {
  css: string
  did: number
  flds: ModelField[]
  id: number
  latexPost: string
  latexPre: string
  mod: number
  name: string
  req: [number, string, number[]]
  sortf: number
  tags: string[]
  tmpls: Template[]
  type: number
  usn: number
  vers: unknown[]
}

export type ModelsObject = Record<string, Model>

// Decks JSONObject structure
export interface Deck {
  name: string
  extendRev?: number
  usn: number
  collapsed: boolean
  browserCollapsed: boolean
  newToday: [number, number]
  revToday: [number, number]
  lrnToday: [number, number]
  timeToday: [number, number]
  dyn: number
  extendNew?: number
  conf?: number
  id: number
  mod: number
  desc: string
}

export type DecksObject = Record<string, Deck>

// DConf JSONObject structure
export interface DConfLapse {
  delays: number[]
  leechAction: number
  leechFails: number
  minInt: number
  mult: number
}

export interface DConfNew {
  bury: boolean
  delays: number[]
  initialFactor: number
  ints: number[]
  order: number
  perDay: number
  separate: boolean
  /** Whether new cards should ignore the daily review limit */
  ignoreReviewLimit?: boolean
}

export interface DConfRev {
  bury: boolean
  ease4: number
  fuzz: number
  ivlFct: number
  maxIvl: number
  minSpace: number
  perDay: number
}

export interface DConf {
  autoplay: boolean
  dyn?: number
  id: number
  lapse: DConfLapse
  leechAction: number
  maxTaken: number
  mod: number
  name: string
  new: DConfNew
  replayq: boolean
  rev: DConfRev
  timer: number
  usn: number
}

export type DConfObject = Record<string, DConf>

// Configuration JSONObject structure
export interface Configuration {
  curDeck: number
  activeDecks: number[]
  newSpread: number
  collapseTime: number
  timeLim: number
  estTimes: boolean
  dueCounts: boolean
  curModel: string
  nextPos: number
  sortType: string
  sortBackwards: boolean
  addToCur: boolean
  dayLearnFirst: boolean
  newBury: boolean
  lastUnburied?: string
  activeCols?: string[]
}
