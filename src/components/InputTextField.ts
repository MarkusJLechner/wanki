export interface InputTextFieldProps<T = string | number> {
  modelValue?: T
  label?: string
  disabled?: boolean
  autofocus?: boolean
  type?: string | null
  placeholder?: string
  autocomplete?: string
}
