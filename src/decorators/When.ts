import { getMetadataStorage } from '../metadata';
import { ClassConstructor } from '../interfaces';

export function When(): PropertyDecorator {
  return function (target, propertyName): void {
    getMetadataStorage().collectWhenMetadata({
      target: target.constructor as ClassConstructor,
      propertyName: propertyName as string,
    });
  };
}
