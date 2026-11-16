import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The design relies on plain <img> tags with the original CSS; next/image would change the markup.
      '@next/next/no-img-element': 'off',
      // Pages link with plain <a> to mirror the static site; fine for a prototype.
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  globalIgnores(['.next/', 'next-env.d.ts', 'src/payload-types.ts', 'src/migrations/', 'src/app/(payload)/']),
])
