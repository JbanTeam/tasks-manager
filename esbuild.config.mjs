import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { rmSync } from 'fs';

rmSync('dist', { recursive: true, force: true });

await build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'cjs',
  sourcemap: true,
  plugins: [nodeExternalsPlugin()],
  outbase: 'src',
});
