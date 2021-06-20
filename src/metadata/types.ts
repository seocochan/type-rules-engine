import { ClassConstructor } from '../interfaces';
import { RuleOptions, ThenOptions } from '../decorators';

export type TargetMetadataMap<T> = Map<ClassConstructor, T>;

export interface RuleMetadataOptions extends RuleOptions {
  name: string;
  description?: string;
  priority?: number;
}

export interface RuleMetadata {
  target: ClassConstructor;
  options: RuleMetadataOptions;
}

export interface WhenMetadata {
  target: ClassConstructor;
  propertyName: string;
}

export interface ThenMetadataOptions extends ThenOptions {
  order: number;
}

export interface ThenMetadata {
  target: ClassConstructor;
  propertyName: string;
  options: ThenMetadataOptions;
}

export interface FactMetadata {
  target: ClassConstructor;
  propertyName: string;
  index: number;
  key?: string;
}
