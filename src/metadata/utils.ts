import { ClassConstructor } from '../interfaces';
import { TargetMetadataMap } from './types';

export function createTargetMetadataMap<T>(): TargetMetadataMap<T> {
  return new Map<ClassConstructor, T>();
}
