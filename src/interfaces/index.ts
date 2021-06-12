import * as immer from 'immer';

export type ClassConstructor<T = unknown> = {
  new (...args: unknown[]): T;
};

export type Immutable<T> = immer.Immutable<T>;

export type Fact = Record<string, unknown>;

export type MutateFn<TFact extends Fact> = (fact: immer.Draft<TFact>) => void;

export type FactProps<TFact extends Fact> = {
  getFact: () => Immutable<TFact>;
  setFact: (mutateFn: MutateFn<TFact>) => void;
};

export type Condition<TFact extends Fact> = (props: FactProps<TFact>) => boolean | Promise<boolean>;

export type Action<TFact extends Fact> = (props: FactProps<TFact>) => void | Promise<void>;
