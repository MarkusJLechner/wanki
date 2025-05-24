export const resolveObjectPath = (object, path, defaultValue) => {
  return path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object)
}
