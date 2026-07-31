import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next 16 ships native flat configs, so no `FlatCompat` bridge is
 * needed (and the bridge in fact fails on this version).
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    /**
     * The WebGL layer.
     *
     * `react-hooks/immutability` assumes React render semantics: it treats any
     * write to a ref target or a material as a render-phase side effect. Inside
     * `useFrame` that is precisely the prescribed React Three Fiber pattern —
     * mutating the scene graph directly is what keeps sixty-frame-per-second
     * animation out of React state, which the performance budget requires. The
     * rule is off here and nowhere else.
     */
    files: ['src/components/three/**/*.ts', 'src/components/three/**/*.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default config;
