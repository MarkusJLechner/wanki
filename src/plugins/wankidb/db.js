import Dexie from 'dexie'

export const wankidb = (() => {
  const db = new Dexie('wankidb')
  db.version(1).stores({
    cards:
      'id,nid,did,ord,mod,usn,type,queue,due,ivl,factor,reps,lapses,left,odue,odid,flags,data',
    col: '++id,crt,mod,scm,ver,dty,usn,ls,conf,models,decks,dconf,tags',
    graves: 'usn,oid,type',
    notes: 'id,guid,mid,mod,usn,tags,flds,sfld,csum,flags,data',
    revlog: 'id,cid,usn,ease,ivl,lastIvl,factor,time,type',
  })

  db.open()
  return db
})()
