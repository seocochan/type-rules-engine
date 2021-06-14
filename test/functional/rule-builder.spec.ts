import { RuleBuilder } from '../../src';

describe('RuleBuilder', () => {
  it('should throw when no condition method is set', () => {
    expect(() => new RuleBuilder().then(() => null).build()).toThrow();
  });

  it('should throw when no action method is set', () => {
    expect(() => new RuleBuilder().when(() => true).build()).toThrow();
  });
});
