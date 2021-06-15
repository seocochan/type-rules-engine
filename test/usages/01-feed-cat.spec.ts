import { getMetadataStorage, RuleBuilder, RulesEngine } from '../../src';

describe('Feed cat', () => {
  beforeAll(() => {
    getMetadataStorage().clear();
  });

  it('should feed hungry cats', async () => {
    const feedCatFact = {
      says: 'meow',
      isHungry: true,
      weight: 5.5,
      feedingCount: 0,
    };
    const feedCatRule = new RuleBuilder<typeof feedCatFact>()
      .name('feed-cat-rule')
      .description('Hungry cats meowing for food')
      .when(({ getFact }) => getFact().says === 'meow' && getFact().isHungry)
      .then(({ setFact }) => {
        setFact(fact => {
          fact.feedingCount++;
          fact.isHungry = false;
        });
      })
      .then(({ setFact }) => {
        setFact(fact => {
          fact.says = 'purr';
          fact.weight += 0.1;
        });
      })
      .build();
    const result = await new RulesEngine().fact(feedCatFact).rules([feedCatRule]).fire();

    expect(result.triggeredRules).toEqual(['feed-cat-rule']);
    expect(result.fact).toEqual({
      says: 'purr',
      isHungry: false,
      weight: 5.6,
      feedingCount: 1,
    });
  });
});
