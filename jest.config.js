export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['\u003crootDir\u003e/src'],
    testMatch: ['**/__tests__/**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/__tests__/**',
    ],
    setupFilesAfterEnv: ['\u003crootDir\u003e/src/__tests__/setup.ts'],
};
