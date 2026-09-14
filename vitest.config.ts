import { defineConfig, configDefaults } from 'vitest/config'
import babel from "@rolldown/plugin-babel";


export default defineConfig({
    plugins: [
        babel({
            plugins: [
                ["@babel/plugin-proposal-decorators", {version: "2023-11"}]
            ]
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.spec.{ts,tsx,js,jsx}'],
        exclude: [...configDefaults.exclude, '**/*.stories.*'],
        testTimeout: 10000,
    },
})
