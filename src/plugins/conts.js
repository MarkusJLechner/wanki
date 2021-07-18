export function getConstName(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

export const QueueType = {
  ManuallyBuried: -3,
  SiblingBuried: -2,
  Suspended: -1,
  New: 0,
  Learn: 1,
  Review: 2,
  DayLearnRelearn: 3,
  Preview: 4,
}

export const CardType = {
  New: 0,
  Learn: 1,
  Review: 2,
  Relearning: 3,
}

export const NewCardOrder = {
  Random: 0,
  Due: 1,
}

export const Ease = {
  Again: 0,
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
}

export const StatisticType = {
  New: 'new',
}
