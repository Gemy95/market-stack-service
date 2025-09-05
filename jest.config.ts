import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { JestConfigWithTsJest } from 'ts-jest';
import { config } from 'dotenv';
config();

const jestConfig: JestConfigWithTsJest = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(controller|service).(t)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>',
  }),
  collectCoverage: process.env.COVERAGE === 'true',
  coverageThreshold: {
    global: {
      branches: +process.env.COVERAGE_THRESHOLD_BRANCHES,
      functions: +process.env.COVERAGE_THRESHOLD_FUNCTIONS,
      lines: +process.env.COVERAGE_THRESHOLD_LINES,
      statements: +process.env.COVERAGE_THRESHOLD_STATEMENTS,
    },
  },
};
export default jestConfig;
