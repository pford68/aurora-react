/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import babel from "@rolldown/plugin-babel";
// https://vite.dev/config/
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {playwright} from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));


// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [
        react(),
        babel({
            plugins: [
                ["@babel/plugin-proposal-decorators", {version: "2023-11"}]
            ]
        }),
    ],
    oxc: {
        target: 'es2023'
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'aurora-react',
            fileName: (format) => `aurora-react.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
    test: {
        projects: [{
            extends: true,
            plugins: [
                // The plugin will run tests for the stories defined in your Storybook config
                // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                storybookTest({
                    configDir: path.join(dirname, '.storybook')
                })],
            test: {
                name: 'storybook',
                browser: {
                    enabled: true,
                    headless: true,
                    provider: playwright({}),
                    instances: [{
                        browser: 'chromium'
                    }]
                }
            }
        }]
    }
});