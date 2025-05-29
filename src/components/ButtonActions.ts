export interface Action {
  type?: string
  text?: string | (() => string)
  emit?: string
  // Using more specific types instead of any
  [key: string]:
    | string
    | number
    | boolean
    | object
    | null
    | undefined
    | (() => string)
}
