import type { InputTextFieldProps } from './InputTextField'

export interface ModalTextfieldProps<T = string | number>
  extends InputTextFieldProps<T> {
  show?: boolean
  title?: string
  confirm?: boolean
}
