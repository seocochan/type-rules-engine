import { DefaultRuleDefinition } from './default-rule-definition';
import { Action, Condition, Fact } from '../interfaces';
import { RuleDefinition } from './types';
import { RulesEngineError } from '../errors';

export class RuleBuilder<TFact extends Fact> {
  private _name?: string;
  private _description?: string;
  private _priority?: number;
  private _condition?: Condition<TFact>;
  private _actions: Action<TFact>[] = [];

  name(name: string): this {
    this._name = name;
    return this;
  }

  description(description: string): this {
    this._description = description;
    return this;
  }

  priority(priority: number): this {
    this._priority = priority;
    return this;
  }

  when<UFact extends TFact>(condition: Condition<UFact>): RuleBuilder<UFact> {
    this._condition = condition as Condition<TFact>;
    return this;
  }

  then<UFact extends TFact>(action: Action<UFact>): RuleBuilder<UFact> {
    this._actions.push(action as Action<TFact>);
    return this;
  }

  build(): RuleDefinition<TFact> {
    if (!this._condition) {
      throw new RulesEngineError('Condition not set');
    }
    if (this._actions.length === 0) {
      throw new RulesEngineError('Actions not set');
    }
    return new DefaultRuleDefinition({
      name: this._name || 'Rule',
      description: this._description,
      priority: this._priority ?? Number.MAX_SAFE_INTEGER,
      condition: this._condition,
      actions: this._actions,
    });
  }
}
