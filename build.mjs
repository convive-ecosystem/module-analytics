// Empaqueta el cliente del módulo en client/dist/index.js como bundle ESM.
// Externaliza React, hooks, helpers UI y contextos del host vía
// `@convive/host`, de forma que el host y el módulo comparten la misma
// instancia de React.

import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cualquier import que el código del módulo haga de las claves siguientes
// se reescribe a `@convive/host`, que el navegador resuelve via importmap
// al runtime del host.
const HOST_ALIASES = [
  // Componentes UI del host
  '@/components/ui/badge',
  '@/components/ui/button',
  '@/components/ui/card',
  '@/components/ui/dialog',
  '@/components/ui/dropdown',
  '@/components/ui/input',
  '@/components/ui/label',
  '@/components/ui/select',
  '@/components/ui/tabs',
  // Helpers
  '@/lib/api',
  '@/lib/cn',
  '@/lib/format',
  // Contextos
  '@/context/AuthContext',
  '@/context/ThemeContext',
  // Librerías que viven en el host (misma instancia que el host)
  'react',
  'react-router-dom',
  '@tanstack/react-query',
  'recharts',
];

const alias = Object.fromEntries(HOST_ALIASES.map((k) => [k, '@convive/host']));

await build({
  entryPoints: [path.join(__dirname, 'client/index.jsx')],
  outfile: path.join(__dirname, 'client/dist/index.js'),
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  jsx: 'automatic',
  jsxImportSource: '@convive/host',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  alias,
  external: ['@convive/host', '@convive/host/jsx-runtime'],
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
});
