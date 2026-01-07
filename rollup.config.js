import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// External dependencies that should not be bundled
const external = ['@angular/core', 'rxjs', 'rxjs/operators', 'react'];

export default [
    // 1. Core bundle (framework-agnostic)
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named'
            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                sourcemap: true
            }
        ],
        external,
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist',
                declarationMap: false,
                rootDir: 'src',
                exclude: ['**/__tests__/**', '**/*.spec.ts']
            })
        ]
    },

    // 2. React bundle
    {
        input: 'src/react.ts',
        output: [
            {
                file: 'dist/react.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named'
            },
            {
                file: 'dist/react.esm.js',
                format: 'es',
                sourcemap: true
            }
        ],
        external,
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist',
                declarationMap: false,
                exclude: ['**/__tests__/**', '**/*.spec.ts']
            })
        ]
    },

    // 3. Angular bundle
    {
        input: 'src/angular.ts',
        output: [
            {
                file: 'dist/angular.js',
                format: 'cjs',
                sourcemap: true,
                exports: 'named'
            },
            {
                file: 'dist/angular.esm.js',
                format: 'es',
                sourcemap: true
            }
        ],
        external,
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist',
                declarationMap: false,
                exclude: ['**/__tests__/**', '**/*.spec.ts']
            })
        ]
    }
];
