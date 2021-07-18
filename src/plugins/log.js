const printLog = (name, type, bgColor, trace = false, args) => {
  const logStringO = !args || args.length === 0 ? '' : '%o'
  console[trace ? 'trace' : 'log'](
    `%c${type}: ` + name + logStringO,
    `background-color: ${bgColor}; border-radius: 3px; font-weight: 100; padding: 3px 6px; color: white; margin: 0 5px 0 0;`,
    ...args,
  )
}

const verboseLevel = 3
export let trace = false

export const log = (name, ...args) => {
  if (verboseLevel < 3) return
  printLog(name, 'l', '#1E40AF', trace, args)
}

export const warn = (name, ...args) => {
  if (verboseLevel < 1) return
  printLog(name, 'w', '#92400E', trace, args)
}

export const error = (name, ...args) => {
  if (verboseLevel < 1) return
  printLog(name, 'e', '#991B1B', trace, args)
}

export const info = (name, ...args) => {
  if (verboseLevel < 2) return
  printLog(name, 'i', '#9D174D', trace, args)
}

export const debug = {
  log,
  warn,
  error,
  info,
}
