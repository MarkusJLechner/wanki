export const resolveObjectPath = (
  object: any,
  path: string,
  defaultValue: any,
): any => {
  return path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object)
}
