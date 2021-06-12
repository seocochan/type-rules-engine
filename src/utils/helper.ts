/* codes copied from immer */
export function isFrozen(obj: any): boolean {
  if (obj == null || typeof obj !== 'object') return true;
  return Object.isFrozen(obj);
}
