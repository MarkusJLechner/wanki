export function getConstName(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

export const ToastType = {
  error: 'error',
  success: 'success',
  info: 'info',
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

export const DeckType = {
  Standard: 0,
  Dynamic: 1,
}

export const NewCardOrder = {
  Random: 0,
  Due: 1,
}

export const Leech = {
  Suspend: 0,
  TagOnly: 1,
}

export const Ease = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
}

export const StatisticType = {
  New: 'new',
  Review: 'rev',
}
