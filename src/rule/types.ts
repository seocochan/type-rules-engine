import { Fact } from '../interfaces';

export type MutateFn<T extends Fact> = (fact: T) => void;

export type Condition<TFact extends Fact> = (props: {
  fact: TFact;
  setFact: (mutateFn: MutateFn<TFact>) => void;
}) => boolean;

export type Action<TFact extends Fact> = (props: { fact: TFact; setFact: (mutateFn: MutateFn<TFact>) => void }) => void;
