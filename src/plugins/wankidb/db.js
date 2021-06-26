import Dexie from 'dexie'

export const wankidb = (() => {
  const db = new Dexie('wankidb')
  db.version(1).stores({
    cards:
      'id,nid,did,ord,mod,usn,type,queue,due,ivl,factor,reps,lapses,left,odue,odid,flags,data',
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

  db.open()
  return db
})()
