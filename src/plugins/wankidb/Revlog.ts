import { wankidb } from '@/plugins/wankidb/db'
import { BaseTable } from '@/plugins/wankidb/BaseTable'

wankidb.revlog.hook('reading', (obj) => Object.assign(new Revlog(), obj))

/***
 * revlog is a review history; it has a row for every review you've ever done!
 */
export class Revlog extends BaseTable {
  /***
   * epoch-milliseconds timestamp of when you did the review
   */
  id?: number

  /***
   * cards.id
   */
  cid?: number

  /***
   * update sequence number: for finding diffs when syncing.
   *   See the description in the cards table for more info
   */
  usn?: number

  /***
   * which button you pushed to score your recall.
   * review:  1(wrong), 2(hard), 3(ok), 4(easy)
   * learn/relearn:   1(wrong), 2(ok), 3(easy)
   */
  ease?: number

  /***
   * interval (i.e. as in the card table)
   */
  ivl?: number

  /***
   * last interval (i.e. the last value of ivl. Note that this value is not necessarily equal to the actual interval between this review and the preceding review)
   */
  lastIvl?: number

  /***
   * factor
   */
  factor?: number

  /***
   * how many milliseconds your review took, up to 60000 (60s)
   */
  time?: number

  /***
   * 0=learn, 1=review, 2=relearn, 3=cram
   */
  type?: number

  constructor(load?: Record<string, unknown>) {
    super(
      'revlog',
      ['id', 'cid', 'usn', 'ease', 'ivl', 'lastIvl', 'factor', 'time', 'type'],
      load,
    )
  }
}
