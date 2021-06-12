import { freeze, produce, setAutoFreeze } from 'immer';
import cloneDeep from 'lodash.clonedeep';
import { Fact, FactProps, Immutable, MutateFn } from '../interfaces';

export class FactManager<TFact extends Fact> {
  fact: Immutable<TFact>;

  constructor(fact: TFact) {
    if (fact == null || Object.keys(fact).length === 0) {
      throw new Error('Facts validation failed.');
    }
    setAutoFreeze(false);
    this.fact = freeze(cloneDeep(fact), true) as Immutable<TFact>;
  }

  mutate(mutateFn: MutateFn<TFact>): void {
    this.fact = produce(this.fact, mutateFn);
  }

  getFact(): Immutable<TFact> {
    return this.fact;
  }

  cloneFact(): TFact {
    return cloneDeep(this.fact) as TFact;
  }

  toProps(): FactProps<TFact> {
    return {
      getFact: () => this.getFact(),
      setFact: mutateFn => {
        this.mutate(mutateFn);
      },
    };
  }
}
