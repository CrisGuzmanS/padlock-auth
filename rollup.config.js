import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.umd.cjs',
    format: 'umd',
    name: 'PadlockAuth', // Nombre global del módulo UMD
    globals: {
      'arrowy-env': 'ArrowyEnv',
      'jsonwebtoken': 'jwt'
    }
  },
  plugins: [
    resolve(),
    commonjs()
  ],
  external: ['arrowy-env', 'jsonwebtoken']
};
