import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../' }),
  setupFiles: ['dotenv/config'],
};

export default {
  projects: [
    {
      displayName: 'Unit',
      rootDir: 'src',
      testMatch: ['<rootDir>/**/tests/**/*.test.ts'],
      coverageDirectory: './coverage',
      ...config,
    },
  ],
};
