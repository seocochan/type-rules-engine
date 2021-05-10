import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testMatch: ['**/functional/**/*.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
    },
  },
};
export default config;
