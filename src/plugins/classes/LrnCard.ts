export class LrnCard {
  due: number
  cid: number

  constructor(due: number, cardId: number) {
    this.due = due
    this.cid = cardId
  }
}
