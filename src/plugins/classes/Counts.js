export const CountType = {
  New: 'New',
  Learn: 'Learn',
  Review: 'Review',
}

export class Counts {
  newCount
  learnCount
  reviewCount

  constructor(newCount, learnCount, reviewCount) {
    this.newCount = newCount
    this.learnCount = learnCount
    this.reviewCount = reviewCount
  }

  changeCount(index, value) {
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
        throw new Error(index + ' does not exist')
    }
  }

  addNew() {
    this.newCount += 1
  }

  addLearn() {
    this.learnCount += 1
  }

  addReview() {
    this.reviewCount += 1
  }

  total() {
    return this.newCount + this.learnCount + this.reviewCount
  }

  equals(count) {
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
