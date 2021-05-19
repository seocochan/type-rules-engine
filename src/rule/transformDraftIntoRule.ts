import { ClassConstructor, Fact } from '../interfaces';
import { RuleDefinition } from './rule-definition';
import { getMetadataStorage } from '../metadata';
import { RuleDraft } from './rule-draft';

export function transformDraftIntoRule(draft: RuleDraft<Fact>): RuleDefinition<Fact> {
  const target = draft.constructor as ClassConstructor;
  const ruleMetadata = getMetadataStorage().findOneRuleMetadata(target);
  if (!ruleMetadata) {
    throw new Error('@Rule metadata not found');
  }
  const [whenMetadata, ...restWhenMetadatas] = getMetadataStorage().findAllWhenMetadata(target);
  if (!whenMetadata) {
    throw new Error('@When metadata not found');
  }
  if (restWhenMetadatas.length > 0) {
    throw new Error('@When decorator must be specified on one method');
  }
  const thenMetadatas = getMetadataStorage()
    .findAllThenMetadata(target)
    .sort((a, b) => (a.options.order ?? 0) - (b.options.order ?? 0));
  if (thenMetadatas.length === 0) {
    throw new Error('@Then metadata not found');
  }

  const { name, description, priority } = ruleMetadata.options;
  return new RuleDefinition({
    name: name || 'Rule',
    description,
    priority: priority ?? Number.MAX_SAFE_INTEGER,
    condition: props => {
      Object.assign(draft, { fact: props.fact, setFact: props.setFact });
      const result: unknown = (draft[whenMetadata.propertyName as keyof typeof draft] as Function)();
      if (typeof result !== 'boolean') {
        throw new Error('Condition method must return boolean value');
      }
      return result;
    },
    actions: thenMetadatas.map(thenMetadata => {
      return props => {
        Object.assign(draft, { fact: props.fact, setFact: props.setFact });
        (draft[thenMetadata.propertyName as keyof typeof draft] as Function)();
      };
    }),
  });
}
