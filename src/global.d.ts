import { Card } from '@/plugins/wankidb/Card'
import { Grave } from '@/plugins/wankidb/Grave'
import { Col } from '@/plugins/wankidb/Col'
import { Deck } from '@/plugins/wankidb/Deck'
import { Revlog } from '@/plugins/wankidb/Revlog'
import { Note } from '@/plugins/wankidb/Note'
import { Model } from '@/plugins/wankidb/Model'
import { wankidb } from '@/plugins/wankidb/db'

interface WankiInterface {
  db: typeof wankidb
  Card: typeof Card
  Col: typeof Col
  Grave: typeof Grave
  Deck: typeof Deck
  Note: typeof Note
  Model: typeof Model
  Revlog: typeof Revlog
}

declare global {
  interface Window {
    wanki: WankiInterface
    anki: WankiInterface // Adding anki as an alias for wanki
  }
}

export {}
