export function is_object(value: unknown) {
 return typeof value === 'object' && value != null
}

export function is_function (value:unknown) {
  return typeof value === 'function'
}