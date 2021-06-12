import { Fact } from '../interfaces';

export type RulesEngineConfig = {
  skipOnFirstAppliedRule?: boolean;
  skipOnFirstNonTriggeredRule?: boolean;
  skipOnFirstFailedRule?: boolean;
  throwOnError?: boolean; // if set to true, `skipOnFirstFailedRule` will be ignored TODO: secure by design
  debug?: boolean;
};

export type RulesEngineResult<TFact extends Fact> = {
  triggeredRules: string[];
  fact: TFact;
};
