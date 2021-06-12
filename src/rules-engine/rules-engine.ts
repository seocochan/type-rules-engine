import { RulesEngineConfig, RulesEngineResult } from './types';
import { Fact } from '../interfaces';
import { RuleDefinition, RuleDraft, transformDraftIntoRule } from '../rule';
import { RulesEngineError } from '../errors';
import { FactManager } from './fact-manager';

export class RulesEngine<TFact extends Fact> {
  private _rules: RuleDefinition<TFact>[] = [];
  private factManager?: FactManager<TFact>;
  private config: RulesEngineConfig;

  constructor(config?: RulesEngineConfig) {
    this.config = {
      skipOnFirstNonTriggeredRule: config?.skipOnFirstNonTriggeredRule ?? false,
      skipOnFirstAppliedRule: config?.skipOnFirstAppliedRule ?? false,
      skipOnFirstFailedRule: config?.skipOnFirstFailedRule ?? false,
      throwOnError: config?.throwOnError ?? false,
      debug: config?.debug ?? false,
    };
  }

  public fact<UFact extends TFact>(fact: UFact): RulesEngine<UFact> {
    this.factManager = new FactManager(fact);
    return this as RulesEngine<UFact>;
  }

  public rules<UFact extends TFact>(rules: Array<RuleDefinition<UFact> | RuleDraft<UFact>>): RulesEngine<UFact> {
    this._rules = rules.map(rule =>
      rule instanceof RuleDraft ? transformDraftIntoRule(rule) : rule
    ) as RuleDefinition<TFact>[];
    return this as RulesEngine<UFact>;
  }

  public async fire(): Promise<RulesEngineResult<TFact>> {
    this.validateRules(); // TODO: assert non null
    const rules = this.sortRules();
    const triggeredRules: string[] = [];
    if (!this.factManager) {
      throw new RulesEngineError('');
    }

    for (const rule of rules) {
      let evaluationResult = false;
      try {
        evaluationResult = await rule.condition(this.factManager.toProps());
        this.config.debug && console.log(`Evaluate '${rule.name}' (result: ${evaluationResult.toString()})`);
      } catch (e) {
        if (e instanceof RulesEngineError) {
          throw e;
        }
        if (this.config.throwOnError) {
          throw e;
        }
        if (this.config.skipOnFirstNonTriggeredRule) {
          break;
        }
      }
      if (evaluationResult) {
        triggeredRules.push(rule.name);
        try {
          for (const action of rule.actions) {
            await action(this.factManager.toProps());
          }
          this.config.debug && console.log(`Triggered '${rule.name}'`);
          if (this.config.skipOnFirstAppliedRule) {
            break;
          }
        } catch (e) {
          if (e instanceof RulesEngineError) {
            throw e;
          }
          if (this.config.throwOnError) {
            throw e;
          }
          if (this.config.skipOnFirstFailedRule) {
            break;
          }
        }
      } else {
        if (this.config.skipOnFirstNonTriggeredRule) {
          break;
        }
      }
    }
    return { triggeredRules, fact: this.factManager.cloneFact() };
  }

  // TODO: separate to RuleCollection class??
  private validateRules(): void {
    if (this._rules == null || this._rules.length === 0) {
      throw new RulesEngineError('Rules validation failed.');
    }
  }

  private sortRules(): RuleDefinition<TFact>[] {
    const rulesWithIndex = this._rules.map((rule, index) => [index, rule] as const);
    return rulesWithIndex
      .sort(([index1, rule1], [index2, rule2]) => {
        if (rule1.priority == null || rule2.priority == null) {
          throw new RulesEngineError(`'Rule.priority' must be set before sorting.`);
        }
        return rule1.priority - rule2.priority || index1 - index2;
      })
      .map(([_, rule]) => rule);
  }
}
