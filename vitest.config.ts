import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.spec.{ts,tsx,js,jsx}'],
        exclude: [...configDefaults.exclude, '**/*.stories.*'],
    },
})
