import { ClassConstructor, Fact } from '../interfaces';
import { DefaultRuleDefinition } from './default-rule-definition';
import { getMetadataStorage } from '../metadata';
import { RuleDraft } from './rule-draft';
import { RuleDefinition } from './types';
import { RulesEngineError } from '../errors';

export function transformDraftIntoRule<TFact extends Fact>(draft: RuleDraft<TFact>): RuleDefinition<TFact> {
  const target = draft.constructor as ClassConstructor;
  const ruleMetadata = getMetadataStorage().findOneRuleMetadata(target);
  if (!ruleMetadata) {
    throw new RulesEngineError('@Rule metadata not found');
  }
  const [whenMetadata, ...restWhenMetadatas] = getMetadataStorage().findAllWhenMetadata(target);
  if (!whenMetadata) {
    throw new RulesEngineError('@When metadata not found');
  }
  if (restWhenMetadatas.length > 0) {
    throw new RulesEngineError('@When decorator must be specified on one method');
  }
  const thenMetadatas = getMetadataStorage()
    .findAllThenMetadata(target)
    .sort((a, b) => a.options.order - b.options.order);
  if (thenMetadatas.length === 0) {
    throw new RulesEngineError('@Then metadata not found');
  }

  const { name, description, priority } = ruleMetadata.options;
  return new DefaultRuleDefinition({
    name,
    description,
    priority: priority ?? Number.MAX_SAFE_INTEGER,
    condition: props => {
      Object.assign(draft, { getFact: props.getFact, setFact: props.setFact });
      const result: unknown = (draft[whenMetadata.propertyName as keyof typeof draft] as Function)();
      if (typeof result !== 'boolean') {
        throw new RulesEngineError('Condition method must return boolean value');
      }
      return result;
    },
    actions: thenMetadatas.map(thenMetadata => {
      return props => {
        Object.assign(draft, { getFact: props.getFact, setFact: props.setFact });
        (draft[thenMetadata.propertyName as keyof typeof draft] as Function)();
      };
    }),
  });
}
