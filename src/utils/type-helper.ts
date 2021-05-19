import { NotNullAssertionError } from '../errors';

export function notNull<T>(value: T): NonNullable<T> {
  if (value == null) {
    throw new NotNullAssertionError();
  }
  return value as NonNullable<T>;
}
