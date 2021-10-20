import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import pkg from '../package.json';

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license: ${pkg.license}
 */
`;

const name = 'VueAuth';
const input = 'src/vue-auth.ts';
const globals = {
  '@andrewcaires/vue-cookie': 'VueCookie',
  '@andrewcaires/vue-fetch': 'VueFetch',
  'vue': 'Vue'
};
const external = [
  '@andrewcaires/vue-cookie',
  '@andrewcaires/vue-fetch',
  'vue'
];

const output = (formats) => {

  return Object.keys(formats).map((format) => {

    return { globals, name, exports: 'named', file: formats[format], format };
  });
}

export default {
  input,
  external,
  output: output({ cjs: pkg.main, es: pkg.module, iife: pkg.unpkg }),
  plugins: [
    typescript({ module: 'esnext', tsconfig: './tsconfig.json' }),
    commonjs({ extensions: ['.js', '.ts'] }),
    terser({ format: { comments: false } }),
    { renderChunk: async (code) => banner + code },
  ],
};
