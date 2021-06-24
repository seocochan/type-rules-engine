import { getMetadataStorage, Rule, RuleBuilder, RuleDraft, RulesEngine, Then, When } from '../../src';

describe('Apply discount coupon', () => {
  beforeAll(() => {
    getMetadataStorage().clear();
  });

  it('should apply discount coupon properly', async () => {
    const fact = {
      order: {
        amount: 100000,
        discount: 0,
      },
      coupon: {
        discountRate: 0.2,
        maxDiscountAmount: 10000,
        minOrderAmount: 30000,
        useCount: 0,
        useCountLimit: 1,
      },
      result: {
        isValid: true,
        error: null,
      },
    };

    const validateUseCountRule = new RuleBuilder<typeof fact>()
      .name('validate-use-count-rule')
      .description('Reject if use count exceeded')
      .when(({ getFact }) => {
        const { useCount, useCountLimit } = getFact().coupon;
        return useCount >= useCountLimit;
      })
      .then(({ setFact }) => {
        setFact(fact => {
          fact.result.isValid = false;
          fact.result.error = 'Exceeded use limit';
        });
      })
      .build();
    const validateMinOrderAmountRule = new RuleBuilder<typeof fact>()
      .name('validate-min-order-amount-rule')
      .description('Reject if minimum order amount not reached')
      .when(({ getFact }) => {
        const fact = getFact();
        return fact.order.amount < fact.coupon.minOrderAmount;
      })
      .then(({ setFact }) => {
        setFact(fact => {
          fact.result.isValid = false;
          fact.result.error = 'Insufficient order amount';
        });
      })
      .build();

    const validationEngine = new RulesEngine({ skipOnFirstAppliedRule: true });
    const validationResult = await validationEngine
      .fact(fact)
      .rules([validateUseCountRule, validateMinOrderAmountRule])
      .fire();

    expect(validationResult.triggeredRules).toEqual([]);
    expect(validationResult.fact.result).toEqual({ isValid: true, error: null });

    @Rule({
      name: 'apply-discount-rule',
      description: 'Calculate and apply discount amount by given rate',
      priority: 1,
    })
    class ApplyDiscountRule extends RuleDraft<typeof fact> {
      @When()
      hasDiscountRate() {
        return this.getFact().coupon.discountRate > 0;
      }

      @Then({ order: 1 })
      applyDiscount() {
        this.setFact(fact => {
          fact.order.discount = fact.order.amount * fact.coupon.discountRate;
        });
      }

      @Then({ order: 2 })
      increaseCount() {
        this.setFact(fact => {
          fact.coupon.useCount++;
        });
      }
    }
    const limitMaxDiscountRule = new RuleBuilder<typeof fact>()
      .name('limit-max-discount-rule')
      .description('Limit discount if it exceed maximum discount amount')
      .priority(2)
      .when(({ getFact }) => getFact().order.discount > getFact().coupon.maxDiscountAmount)
      .then(({ setFact }) => {
        setFact(fact => {
          fact.order.discount = fact.coupon.maxDiscountAmount;
        });
      })
      .build();

    const applicationEngine = new RulesEngine();
    const applicationResult = await applicationEngine
      .fact(fact)
      .rules([limitMaxDiscountRule, new ApplyDiscountRule()])
      .fire();

    expect(applicationResult.triggeredRules).toEqual(['apply-discount-rule', 'limit-max-discount-rule']);
    expect(applicationResult.fact.order.discount).toEqual(10000);
    expect(applicationResult.fact.coupon.useCount).toEqual(1);
  });
});
