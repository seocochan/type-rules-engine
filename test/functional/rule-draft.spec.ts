import { getMetadataStorage, RuleDefinition, RuleDraft, transformDraftIntoRule } from '../../src';
import { Rule, Then, When } from '../../src/decorators';

describe('RuleDraft', () => {
  beforeAll(() => {
    getMetadataStorage().clear();
  });

  it('should be transformed into rule', () => {
    const name = 'Sample rule';
    const description = 'description goes here';
    const priority = 1;
    const actionHistory = [];

    @Rule({ name, description, priority })
    class SampleRule extends RuleDraft<{ message: string }> {
      @When()
      always() {
        return true;
      }

      @Then({ order: 1 })
      doSomething() {
        actionHistory.push('doSomething');
      }

      @Then({ order: 2 })
      doSomethingMore() {
        actionHistory.push('doSomethingMore');
      }
    }

    // check rule definition
    const sampleRule = transformDraftIntoRule(new SampleRule());
    expect(sampleRule).toBeInstanceOf(RuleDefinition);
    expect(sampleRule).toMatchObject({ name, description, priority });

    // check behavior of condition and action methods
    const emptyProps = { fact: {}, setFact: () => null };
    expect(sampleRule.condition(emptyProps)).toEqual(true);
    expect(sampleRule.actions).toHaveLength(2);
    sampleRule.actions.forEach(action => {
      expect(action(emptyProps)).toBeUndefined();
    });
    expect(actionHistory).toEqual(['doSomething', 'doSomethingMore']);
  });
});
