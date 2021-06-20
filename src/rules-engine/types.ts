import { Fact } from '../interfaces';

export type RulesEngineConfig = {
  skipOnFirstAppliedRule?: boolean;
  skipOnFirstNonTriggeredRule?: boolean;
  skipOnFirstFailedRule?: boolean;
  throwOnError?: boolean;
  debug?: boolean;
};

export type RulesEngineResult<TFact extends Fact> = {
  triggeredRules: string[];
  fact: TFact;
};
