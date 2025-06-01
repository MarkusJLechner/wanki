export function getConstName<T extends Record<string, unknown>>(
  object: T,
  value: unknown,
): string | undefined {
  return Object.keys(object).find((key) => object[key] === value)
}

export const ToastType = {
  error: 'error',
  success: 'success',
  info: 'info',
} as const

export type ToastTypeValues = (typeof ToastType)[keyof typeof ToastType]

export const QueueType = {
  ManuallyBuried: -3,
  SiblingBuried: -2,
  Suspended: -1,
  New: 0,
  Learn: 1,
  Review: 2,
  DayLearnRelearn: 3,
  Preview: 4,
} as const

export type QueueTypeValues = (typeof QueueType)[keyof typeof QueueType]

export const CardType = {
  New: 0,
  Learn: 1,
  Review: 2,
  Relearning: 3,
} as const

export type CardTypeValues = (typeof CardType)[keyof typeof CardType]

export const DeckType = {
  Standard: 0,
  Dynamic: 1,
} as const

export type DeckTypeValues = (typeof DeckType)[keyof typeof DeckType]

export const NewCardOrder = {
  Random: 0,
  Due: 1,
} as const

export type NewCardOrderValues =
  (typeof NewCardOrder)[keyof typeof NewCardOrder]

export const Leech = {
  Suspend: 0,
  TagOnly: 1,
} as const

export type LeechValues = (typeof Leech)[keyof typeof Leech]

export const Ease = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
} as const

export type EaseValues = (typeof Ease)[keyof typeof Ease]

export const StatisticType = {
  New: 'new',
  Review: 'rev',
} as const

export type StatisticTypeValues =
  (typeof StatisticType)[keyof typeof StatisticType]
