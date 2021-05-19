import { RuleMetadata, TargetMetadataMap, ThenMetadata, WhenMetadata } from './types';
import { createTargetMetadataMap } from './utils';
import { notNull } from '../utils';
import { ClassConstructor } from '../interfaces';

export class MetadataStorage {
  private ruleCollection: TargetMetadataMap<RuleMetadata> = createTargetMetadataMap();
  private whenCollection: TargetMetadataMap<WhenMetadata[]> = createTargetMetadataMap();
  private thenCollection: TargetMetadataMap<ThenMetadata[]> = createTargetMetadataMap();

  clear(): void {
    this.ruleCollection.clear();
    this.whenCollection.clear();
    this.thenCollection.clear();
  }

  collectRuleMetadata(metadata: RuleMetadata): void {
    this.ruleCollection.set(metadata.target, metadata);
  }

  collectWhenMetadata(metadata: WhenMetadata): void {
    if (!this.whenCollection.has(metadata.target)) {
      this.whenCollection.set(metadata.target, []);
    }
    notNull(this.whenCollection.get(metadata.target)).push(metadata);
  }

  collectThenMetadata(metadata: ThenMetadata): void {
    if (!this.thenCollection.has(metadata.target)) {
      this.thenCollection.set(metadata.target, []);
    }
    notNull(this.thenCollection.get(metadata.target)).push(metadata);
  }

  findOneRuleMetadata(target: ClassConstructor): RuleMetadata | undefined {
    return this.ruleCollection.get(target);
  }

  findAllWhenMetadata(target: ClassConstructor): WhenMetadata[] {
    return this.whenCollection.get(target) ?? [];
  }

  findAllThenMetadata(target: ClassConstructor): ThenMetadata[] {
    return this.thenCollection.get(target) ?? [];
  }
}
