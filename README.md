<h1 align="center">type-rules-engine</h1>

<p align="center">
Simple, declarative and immutable rules engine for TypeScript.
</p>

<p align="center">
  <a href="https://github.com/seocochan/type-rules-engine/actions/workflows/continuous-integration-workflow.yml?query=branch:main">
    <img src="https://img.shields.io/github/workflow/status/seocochan/type-rules-engine/CI/main.svg?style=flat-square" alt="build status" height="18">
  </a>
  <a href="https://codecov.io/gh/seocochan/type-rules-engine?branch=main">
    <img src="https://img.shields.io/codecov/c/gh/seocochan/type-rules-engine.svg?style=flat-square" alt="codecov" height="18">
  </a>
  <a href="https://www.npmjs.com/package/type-rules-engine">
    <img src="https://img.shields.io/npm/v/type-rules-engine.svg?style=flat-square" alt="npm version" height="18">
  </a>
</p>

## Highlights

- Easy to use API.
- Supports various ways to define rules.
- Provides immutable fact object, powered by [`immer`](https://github.com/immerjs/immer).
- Fully tested.

## Installation

`reflect-metadata` package is required, 
since `type-rules-engine` provides decorator based rule definition.

```
npm install type-rules-engine reflect-metadata
# or
yarn add type-rules-engine reflect-metadata
```

And be sure to `reflect-metadata` is imported before using `type-rules-engine`

```typescript
import "reflect-metadata";
```

Last, a little `tsconfig.json` tweak is needed.

```
{
    "compilerOptions": {
        ...
        "experimentalDecorators": true,
        ...
    }
}
```

## Usage

```ts
// 1. Define fact object
const feedCatFact = {
  says: 'meow',
  isHungry: true,
  weight: 5.5,
  feedingCount: 0,
};

// 2. Define rule - using builder API
const feedCatRule = new RuleBuilder<typeof feedCatFact>()
  .name('feed-cat-rule')
  .description('Hungry cats meowing for food')
  .priority(1)
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

// or using class and decorators
@Rule({ 
  name: 'feed-cat-rule', 
  description: 'Hungry cats meowing for food',
  priority: 1,
})
class FeedCatRule extends RuleDraft<typeof feedCatFact> {
  @When()
  isCatHungry() {
    const { says, isHungry } = this.getFact();
    return says === 'meow' && isHungry;
  }
  
  @Then({ order: 1 })
  feedCat() {
    this.setFact(fact => {
      fact.feedingCount++;
      fact.isHungry = false;
    });
  }

  @Then({ order: 2 })
  gainWeight() {
    this.setFact(fact => {
      fact.says = 'purr';
      fact.weight += 0.1;
    });
  }
}
const feedCarRule = new FeedCatRule()

// 3. Fire rules engine
const result = await new RulesEngine().fact(feedCatFact).rules([feedCatRule]).fire();
expect(result.triggeredRules).toEqual(['feed-cat-rule']);
expect(result.fact).toEqual({
  says: 'purr',
  isHungry: false,
  weight: 5.6,
  feedingCount: 1,
});
```
more usages can be found [here](/test/usages).


## API Reference

We've already covered most APIs in [above](#Usage) part, and I believe that it's self-explanatory enough. 
I'll mention here only about advanced configs and edge cases.

### RulesEngine

`RulesEngine` provides useful options like stop evaluating rules at some point 
or log result for debugging purpose. 

`RulesEngineConfig`:

| Property                                | Default | Description                                                                                                                                                          |
|-----------------------------------------|:-------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `skipOnFirstNonTriggeredRule?: boolean` | `false` | Stops execution when `condition()` fails, if set to `true`.                                                                                                          |
| `skipOnFirstAppliedRule?: boolean`      | `false` | Stops execution when `action()` runs successfully, if set to `true`.                                                                                                 |
| `skipOnFirstFailedRule?: boolean`       | `false` | Stops execution when `action()` throws error, if set to `true`.                                                                                                      |
| `throwOnError?: boolean`                | `false` | Throws when error occurred in `condition()` or `action()`, if set to `true`. <br/> By default, it does not throw error inside rule execution except `RulesEngineError`. |
| `debug?: boolean`                       | `false` | Print evaluation result using `console.log`, if set to `true`.                                                                                                       |

### Immutability

We're in JavaScript world, and we all [love](https://stackoverflow.com/q/34385243/10114911) immutability.
Unlike most rules engines, `type-rules-engine` keeps fact objects immutable, powered by [`immer`](https://github.com/immerjs/immer).

```ts
const fact = { status: 'initialized' };
const rule = new RuleBuilder<typeof fact>()
  .when(() => true)
  .then(({ getFact, setFact }) => {
    // ☠️ Updating fact directly is not allowed.
    getFact().status = 'updated'
    
    // 👌 Instead, use `setFact`.
    setFact(fact => {
      fact.status = 'updated';
    });
  })
  .build();

const result = await new RulesEngine().fact(fact).rules([rule]).fire();

// Updates inside rules engine never affect original fact object.
expect(fact.status).toEqual('initialized');
expect(result.fact.status).toEqual('updated');
```

> Note that `setFact` is just a wrapper around `immer`'s `produce` method. 
See [this page](https://immerjs.github.io/immer/update-patterns) for more descriptions.

## Road map

Features that are planned:

- Custom logger support. Replace default `console.log` on debug mode.
- Rule composition. Something like [this](https://github.com/j-easy/easy-rules/wiki/defining-rules#composite-rules)
- Support for expression language. (Still looking for nice language implementation)

## Inspirations

[`easy-rules`](https://github.com/j-easy/easy-rules) which is written in Java inspired a lot of concepts and core API designs of this library.

## Contributing

1. Fork this repository
1. Create new feature branch
1. Write your codes and commit
1. Make all tests and linter rules pass
1. Push and make pull request
