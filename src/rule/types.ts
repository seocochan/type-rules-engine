import { Action, Condition, Fact } from '../interfaces';

export interface RuleDefinition<TFact extends Fact> {
  name: string;
  description?: string;
  priority: number;
  condition: Condition<TFact>;
  actions: Action<TFact>[];
}
