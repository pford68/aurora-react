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