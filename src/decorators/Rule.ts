import { RuleOptions } from './types';
import { getMetadataStorage } from '../metadata';
import { ClassConstructor } from '../interfaces';

export function Rule(options?: RuleOptions): ClassDecorator {
  return function (target): void {
    getMetadataStorage().collectRuleMetadata({
      target: target as Function as ClassConstructor,
      options: {
        name: options?.name || target.name,
        description: options?.description,
        priority: options?.priority,
      },
    });
  };
}
