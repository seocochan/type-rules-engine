import { RuleBuilder, RulesEngine, RulesEngineError } from '../../src';

function createEmptyRule() {
  return new RuleBuilder()
    .when(() => true)
    .then(() => null)
    .build();
}

describe('RulesEngine', () => {
  it('should throw when empty fact object is set', () => {
    expect(() => new RulesEngine().fact({})).toThrow();
  });

  it('should throw when empty rules array is set', () => {
    expect(() => new RulesEngine().rules([])).toThrow();
  });

  it('should throw when fire() is called before necessary properties are set', async () => {
    await expect(new RulesEngine().fire()).rejects.toThrow();
    await expect(new RulesEngine().fact({ foo: 'uwu' }).fire()).rejects.toThrow();
    await expect(new RulesEngine().rules([createEmptyRule()]).fire()).rejects.toThrow();
  });

  it('should provide console.log() as default logger when config.debug=true', async () => {
    console.log = jest.fn();
    await new RulesEngine({ debug: true }).fact({ foo: 'uwu' }).rules([createEmptyRule()]).fire();
    expect(console.log).toBeCalledTimes(2);
  });

  it('should throw when RulesEngine occurred in condition() or action()', async () => {
    const ruleThrowOnCondition = new RuleBuilder()
      .when(() => {
        throw new RulesEngineError();
      })
      .then(() => null)
      .build();
    const ruleThrowOnAction = new RuleBuilder()
      .when(() => true)
      .then(() => {
        throw new RulesEngineError();
      })
      .build();

    const rulesEngine = new RulesEngine().fact({ foo: 'uwu' });
    await expect(rulesEngine.rules([ruleThrowOnCondition]).fire()).rejects.toThrow(RulesEngineError);
    await expect(rulesEngine.rules([ruleThrowOnAction]).fire()).rejects.toThrow(RulesEngineError);
  });

  it('should throw when error occurred in condition() or action() and config.throwOnError=true', async () => {
    const errorMessage = 'uwu';
    const ruleThrowOnCondition = new RuleBuilder()
      .when(() => {
        throw new Error(errorMessage);
      })
      .then(() => null)
      .build();
    const ruleThrowOnAction = new RuleBuilder()
      .when(() => true)
      .then(() => {
        throw new Error(errorMessage);
      })
      .build();

    const rulesEngine = new RulesEngine({ throwOnError: true }).fact({ foo: 'uwu' });
    await expect(rulesEngine.rules([ruleThrowOnCondition]).fire()).rejects.toThrow(errorMessage);
    await expect(rulesEngine.rules([ruleThrowOnAction]).fire()).rejects.toThrow(errorMessage);
  });

  it('should not throw when error occurred in condition() or action() and config.throwOnError=false', async () => {
    const ruleThrowOnCondition = new RuleBuilder()
      .name('rule-throw-on-condition')
      .when(() => {
        throw new Error();
      })
      .then(() => null)
      .build();
    const ruleThrowOnAction = new RuleBuilder()
      .name('rule-throw-on-action')
      .when(() => true)
      .then(() => {
        throw new Error();
      })
      .build();

    const rulesEngine = new RulesEngine({ throwOnError: false }).fact({ foo: 'uwu' });
    await expect(rulesEngine.rules([ruleThrowOnCondition]).fire()).resolves.toBeDefined();
    await expect(rulesEngine.rules([ruleThrowOnAction]).fire()).resolves.toBeDefined();
  });

  it('should stop execution when condition() fails and config.skipOnFirstNonTriggeredRule=true', async () => {
    const rule1 = new RuleBuilder()
      .name('rule-1')
      .when(() => true)
      .then(() => null)
      .build();
    const rule2FailOnCondition = new RuleBuilder()
      .name('rule-2')
      .when(() => {
        throw new Error();
      })
      .then(() => null)
      .build();
    const rule2FailOnAction = new RuleBuilder()
      .name('rule-2')
      .when(() => false)
      .then(() => null)
      .build();
    const rule3 = new RuleBuilder()
      .name('rule-3')
      .when(() => true)
      .then(() => null)
      .build();

    const rulesEngine = new RulesEngine({ skipOnFirstNonTriggeredRule: true }).fact({ foo: 'uwu' });
    const result1 = await rulesEngine.rules([rule1, rule2FailOnCondition, rule3]).fire();
    const result2 = await rulesEngine.rules([rule1, rule2FailOnAction, rule3]).fire();
    expect(result1.triggeredRules).toEqual(['rule-1']);
    expect(result2.triggeredRules).toEqual(['rule-1']);
  });

  it('should stop execution when action() throws error and config.skipOnFirstFailedRule=true', async () => {
    const rule1 = new RuleBuilder()
      .name('rule-1')
      .when(() => true)
      .then(() => null)
      .build();
    const rule2 = new RuleBuilder()
      .name('rule-2')
      .when(() => true)
      .then(() => {
        throw new Error();
      })
      .build();
    const rule3 = new RuleBuilder()
      .name('rule-3')
      .when(() => true)
      .then(() => null)
      .build();
    const result = await new RulesEngine({ skipOnFirstFailedRule: true })
      .fact({ foo: 'uwu' })
      .rules([rule1, rule2, rule3])
      .fire();
    expect(result.triggeredRules).toEqual(['rule-1', 'rule-2']);
  });

  it('should stop execution when action() runs successfully and config.skipOnFirstAppliedRule=true', async () => {
    const rule1 = new RuleBuilder()
      .name('rule-1')
      .when(() => true)
      .then(() => {
        throw new Error();
      })
      .build();
    const rule2 = new RuleBuilder()
      .name('rule-2')
      .when(() => true)
      .then(() => null)
      .build();
    const rule3 = new RuleBuilder()
      .name('rule-3')
      .when(() => true)
      .then(() => {
        throw new Error();
      })
      .build();
    const result = await new RulesEngine({ skipOnFirstAppliedRule: true })
      .fact({ foo: 'uwu' })
      .rules([rule1, rule2, rule3])
      .fire();
    expect(result.triggeredRules).toEqual(['rule-1', 'rule-2']);
  });
});
