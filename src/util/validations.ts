import type {Collection, Struct} from "../types/types.ts";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^(1[ -]?)?(\d{3}|\(\d{3}\))[ -]?\d{3}[ -]?\d{4}$/;

export function isEmail(text:string): boolean {
    return emailRegex.test(text);
}

export function isPhone(text:string): boolean {
    return phoneRegex.test(text);
}

export function isString(s:unknown): boolean {
    return typeof s === "string";
}

export function isEmpty(s:unknown): boolean {
    return s === null || s === undefined || String(s).trim().length === 0;
}

export function isIterable(value: unknown): value is Iterable<unknown> {
    return value != null && typeof (value as any)[Symbol.iterator] === "function";
}

export function isPlainObject(value: unknown): value is Struct {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Map) &&
        !(value instanceof Set)
    );
}

export function isCollection(value: unknown): value is Collection {
    return value instanceof Map || value instanceof Set || Array.isArray(value);
}
