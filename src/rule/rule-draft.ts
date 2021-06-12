import { Fact, Immutable, MutateFn } from '../interfaces';

export abstract class RuleDraft<TFact extends Fact> {
  private fact!: Immutable<TFact>;

  protected getFact(): Immutable<TFact> {
    return this.fact;
  }

  protected setFact(mutateFn: MutateFn<TFact>): void {
    return;
  }
}
