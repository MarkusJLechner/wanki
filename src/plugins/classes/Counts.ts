export enum CountType {
  New = 'New',
  Learn = 'Learn',
  Review = 'Review',
}

export class Counts {
  newCount: number
  learnCount: number
  reviewCount: number

  constructor(newCount: number, learnCount: number, reviewCount: number) {
    this.newCount = newCount
    this.learnCount = learnCount
    this.reviewCount = reviewCount
  }

  changeCount(index: CountType, value: number): void {
    switch (index) {
      case CountType.New:
        this.newCount += value
        break
      case CountType.Learn:
        this.learnCount += value
        break
      case CountType.Review:
        this.reviewCount += value
        break
      default:
        throw new Error('Invalid count type' + (index as string))
    }
  }

  addNew(): void {
    this.newCount += 1
  }

  addLearn(): void {
    this.learnCount += 1
  }

  addReview(): void {
    this.reviewCount += 1
  }

  total(): number {
    return this.newCount + this.learnCount + this.reviewCount
  }

  equals(count: Counts | null): boolean {
    if (this === count) {
      return true
    }

    if (!count) {
      return false
    }

    return (
      count.newCount === this.newCount &&
      count.learnCount === this.learnCount &&
      count.reviewCount === this.reviewCount
    )
  }
}
