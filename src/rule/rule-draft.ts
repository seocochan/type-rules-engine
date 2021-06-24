import { Fact, Immutable, MutateFn } from '../interfaces';

export abstract class RuleDraft<TFact extends Fact> {
  private fact!: Immutable<TFact>;

  protected getFact(): Immutable<TFact> {
    return this.fact;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected setFact(mutateFn: MutateFn<TFact>): void {
    return;
  }
}
