export type ClassConstructor<T = unknown> = {
  new (...args: unknown[]): T;
};
