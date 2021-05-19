import { Fact } from '../interfaces';
import { Action, Condition } from './types';

export interface RuleCtorOptions<TFact extends Fact> {
  name: string;
  description?: string;
  priority: number;
  condition: Condition<TFact>;
  actions: Action<TFact>[];
}

export class RuleDefinition<TFact extends Fact> {
  public readonly name: string;
  public readonly description?: string;
  public readonly priority: number;
  public readonly condition: Condition<TFact>;
  public readonly actions: Action<TFact>[];

  constructor(options: RuleCtorOptions<TFact>) {
    this.name = options.name;
    this.description = options.description;
    this.priority = options.priority;
    this.condition = options.condition;
    this.actions = options.actions;
  }

  // evaluate

  // execute
}
