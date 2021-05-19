export class NotNullAssertionError extends Error {
  constructor() {
    super('Expected that value is defined but found null. Usually, this error should never occur.');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
