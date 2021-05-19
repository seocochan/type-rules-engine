import { ThenOptions } from './types';
import { getMetadataStorage } from '../metadata';
import { ClassConstructor } from '../interfaces';

export function Then(options?: ThenOptions): PropertyDecorator {
  return function (target, propertyName): void {
    getMetadataStorage().collectThenMetadata({
      target: target.constructor as ClassConstructor,
      propertyName: propertyName as string,
      options: {
        order: options?.order ?? 0,
      },
    });
  };
}
