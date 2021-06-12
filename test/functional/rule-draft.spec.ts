import { getMetadataStorage, RuleDraft, RulesEngine } from '../../src';
import { Rule, Then, When } from '../../src/decorators';

describe('RuleDraft', () => {
  beforeAll(() => {
    getMetadataStorage().clear();
  });

  const rulesEngine = new RulesEngine();
  const fact = { message: 'foo' };

  it('should throw when class is not decorated with @Rule', () => {
    class SampleRule extends RuleDraft<typeof fact> {}
    expect(() => rulesEngine.fact(fact).rules([new SampleRule()])).toThrow();
  });

  it('should throw when no method decorated with @When found', () => {
    @Rule()
    class SampleRule extends RuleDraft<typeof fact> {
      @Then()
      doSomething() {
        return;
      }
    }
    expect(() => rulesEngine.fact(fact).rules([new SampleRule()])).toThrow();
  });

  it('should throw when many methods decorated with @When found', () => {
    @Rule()
    class SampleRule extends RuleDraft<typeof fact> {
      @When()
      checkSomething() {
        return true;
      }

      @When()
      checkSomethingMore() {
        return true;
      }

      @Then()
      doSomething() {
        return;
      }
    }
    expect(() => rulesEngine.fact(fact).rules([new SampleRule()])).toThrow();
  });

  it('should throw when return type of method decorated with @When is not boolean', async () => {
    @Rule()
    class SampleRule extends RuleDraft<typeof fact> {
      @When()
      checkSomething() {
        return 'non boolean value';
      }

      @Then()
      doSomething() {
        return;
      }
    }
    await expect(rulesEngine.fact(fact).rules([new SampleRule()]).fire()).rejects.toThrow();
  });

  it('should throw when no method decorated with @Then found', () => {
    @Rule()
    class SampleRule extends RuleDraft<typeof fact> {
      @When()
      checkSomething() {
        return true;
      }
    }
    expect(() => rulesEngine.fact(fact).rules([new SampleRule()])).toThrow();
  });
});
