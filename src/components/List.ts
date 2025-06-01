import { StorageKey } from 'plugins/defaultSettings.ts'

export interface RadioItem {
  /**
   * Display text for the radio option
   */
  text: string
  /**
   * Value associated with the radio option
   */
  value: string | number
}

export interface ListItemRadio {
  /**
   * Title displayed in the radio modal
   */
  title: string
  /**
   * Storage key for saving the selected value
   */
  key: StorageKey
  /**
   * Default value when no selection is made
   */
  default: string | number
  /**
   * Array of radio options to display
   */
  items: Array<RadioItem>
}

export interface ListItem {
  /**
   * Main text displayed for the list item
   */
  text?: string
  /**
   * Secondary text displayed below the main text
   */
  subtext?: string | (() => string)
  /**
   * Storage key for toggle state
   */
  toggle?: string
  /**
   * Default value for toggle
   */
  toggleDefault?: boolean
  /**
   * Icon class to display before the text
   */
  icon?: string | (() => string)
  /**
   * Type of list item (e.g., 'textfield')
   */
  kind?: string
  /**
   * Label above input
   */
  label?: string
  /**
   * Local storage key for this item's value
   */
  storeLocal?: string
  /**
   * Database path in the form "table.column.path"
   */
  storeDb?: {
    get: () => string | number | null | boolean
    save: (value: any) => void
  }
  /**
   * Placeholder text for input fields
   */
  placeholder?: string
  /**
   * Visual type of the item (e.g., 'seperator')
   */
  type?: string
  /**
   * Title for modals triggered by this item
   */
  title?: string
  /**
   * Radio configuration for this item
   */
  radio?: ListItemRadio
  /**
   * Boolean value or function returning boolean
   */
  boolean?: boolean | (() => boolean)
  /**
   * Loading state indicator
   */
  loading?: boolean | (() => boolean)
  /**
   * Custom component to render
   */
  component?: any
  /**
   * CSS class to apply to the item
   */
  class?: string
  /**
   * Inline styles to apply to the item
   */
  style?: any
  /**
   * Function called when item is clicked
   */
  click?: (item: ListItem) => void
  /**
   * Route to navigate to when clicked
   */
  route?: string
  /**
   * Query parameters for route navigation
   */
  routeQuery?: Record<string, string>
  /**
   * Function to dispatch when item is clicked
   */
  dispatch?: (item: ListItem) => void
}

export interface ListProps {
  /**
   * Array of list items to display
   */
  value: Array<ListItem>
  /**
   * Whether to remove padding around the list
   */
  noGutters?: boolean
  /**
   * Whether to use compact spacing for list items
   */
  dense?: boolean
  /**
   * Whether to hide separators between list items
   */
  noSeparation?: boolean
  /**
   * Property name to use for item text
   */
  itemTextKey?: string
}
