import cleanup from 'rollup-plugin-cleanup';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const plugins = [
    resolve(),
    commonjs(),
    cleanup()
];

export default [
    {
        input: "./index.js",
        output: {
            file: "build/index.mjs",
            format: "esm"
        },
        plugins
    },
    {
        input: "./src/lamb.js",
        output: {
            file: "build/lamb.mjs",
            format: "esm"
        },
        plugins
    },
    {
        input: "./src/mapper.js",
        output: {
            file: "build/mapper.mjs",
            format: "esm"
        },
        plugins
    },
    {
        input: "./src/splitter.js",
        output: {
            file: "build/splitter.mjs",
            format: "esm"
        },
        plugins
    },
]
