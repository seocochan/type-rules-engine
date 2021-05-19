import { Fact } from '../interfaces';
import { MutateFn } from './types';

export abstract class RuleDraft<T extends Fact> {
  protected readonly fact!: T;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected setFact(mutateFn: MutateFn<T>): void {
    // no implementation
  }
}
