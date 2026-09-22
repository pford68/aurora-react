import { describe, it, expect } from 'vitest';
import {structuredCloneWithInstances} from "../utils.ts"; // adjust path as needed

// A Mock Custom Class that structuredClone normally strips/empties
class MockCustomValue {
    #value: number;

    constructor(value: number) {
        this.#value = value;
    }

    valueOf(): number {
        return this.#value;
    }

    clone(newValue: number): this {
        return new MockCustomValue(newValue) as this;
    }
}


describe('structuredCloneWithInstances()', () => {
    it('should successfully clone plain primitives', () => {
        const input = {
            id: 101,
            name: 'Philip',
            isActive: true,
        };

        const result = structuredCloneWithInstances(input);

        expect(result).toEqual(input);
        expect(result).not.toBe(input); // Ensure it's a new reference
    });

    it('should restore custom objects that structuredClone flattens into empty objects', () => {
        const customInstance = new MockCustomValue(42);
        const input = {
            id: 1,
            customField: customInstance,
        };

        const result = structuredCloneWithInstances(input);

        // Verify properties match
        expect(result.id).toBe(1);

        // Verify the custom fallback was executed and values match
        expect(result.customField).toBeInstanceOf(MockCustomValue);
        expect(result.customField?.valueOf()).toBe(42);

        // Ensure references are distinct
        expect(result.customField).not.toBe(customInstance);
    });

    it('should handle null properties gracefully without throwing an error', () => {
        const input = {
            missingData: null,
            tags: ['react', 'typescript'],
        };

        expect(() => structuredCloneWithInstances(input)).not.toThrow();

        const result = structuredCloneWithInstances(input);
        expect(result.missingData).toBeNull();
        expect(result.tags).toEqual(['react', 'typescript']);
    });

    it('should skip standard plain empty objects that do not implement clone', () => {
        const input = {
            emptyObj: {},
        };

        const result = structuredCloneWithInstances(input);
        expect(result.emptyObj).toEqual({});
    });
});
