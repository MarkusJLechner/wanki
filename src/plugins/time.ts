import { refstorage } from 'store/globalstate.ts'

export const STORAGE_KEY = 'testing.timeOffset'

export function getTimeOffset(): number {
  const value = refstorage.get(STORAGE_KEY)
  return value ? +value : 0
}

export function setTimeOffset(offset: number): void {
  refstorage.set(STORAGE_KEY, String(offset))
}

export function addTime(ms: number): void {
  setTimeOffset(getTimeOffset() + ms)
}

export function now(): number {
  return Date.now() + getTimeOffset()
}

export function nowDate(): Date {
  return new Date(now())
}

export const advanceTime = addTime
