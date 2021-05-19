import { ClassConstructor } from '../interfaces';
import { RuleOptions, ThenOptions } from '../decorators';

export type TargetMetadataMap<T> = Map<ClassConstructor, T>;

export interface RuleMetadata {
  target: ClassConstructor;
  options: RuleOptions;
}

export interface WhenMetadata {
  target: ClassConstructor;
  propertyName: string;
}

export interface ThenMetadata {
  target: ClassConstructor;
  propertyName: string;
  options: ThenOptions;
}

export interface FactMetadata {
  target: ClassConstructor;
  propertyName: string;
  index: number;
  key?: string;
}
