import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/index.js',
  output: {
    file: './calendar-card.js',
    format: 'umd',
    name: 'CalendarCard'
  },
  plugins: [
    resolve(),
    commonjs()
  ],
};