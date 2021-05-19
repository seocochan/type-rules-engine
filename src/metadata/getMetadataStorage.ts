import { MetadataStorage } from './metadata-storage';

export function getMetadataStorage(): MetadataStorage {
  return global.TypeRulesEngineMetadataStorage || (global.TypeRulesEngineMetadataStorage = new MetadataStorage());
}
