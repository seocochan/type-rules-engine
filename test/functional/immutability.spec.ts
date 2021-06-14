import { getMetadataStorage, RuleBuilder, RuleDraft, RulesEngine } from '../../src';
import { Rule, Then, When } from '../../src/decorators';

describe('Immutability', () => {
  beforeAll(() => {
    getMetadataStorage().clear();
  });

  it('should ensure immutability of fact objects between inside and outside of RulesEngine', async () => {
    const fact = { status: 'initialized' };
    const rule = new RuleBuilder<typeof fact>()
      .when(() => true)
      .then(({ setFact }) => {
        setFact(fact => {
          fact.status = 'evaluated';
        });
      })
      .build();
    const result = await new RulesEngine().fact(fact).rules([rule]).fire();
    fact.status = 'mutated';
    expect(fact.status).toEqual('mutated');
    expect(result.fact.status).toEqual('evaluated');
  });

  it('should throw when attempting to mutate fact objects inside RulesEngine', async () => {
    const fact = { status: 'initialized' };

    @Rule()
    class SampleRule extends RuleDraft<typeof fact> {
      @When()
      always() {
        return true;
      }

      @Then()
      mutate() {
        /* Force mutate fact */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.getFact().status = 'mutated';
      }
    }
    await expect(new RulesEngine({ throwOnError: true }).fact(fact).rules([new SampleRule()]).fire()).rejects.toThrow();
  });
});
