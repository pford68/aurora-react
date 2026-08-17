import type {DataTransferObject} from "./types.ts";
import {toISODateString} from "../../util/utils.ts";


export abstract class AbstractDecorator<T> implements DataTransferObject<T> {
    protected get format(): string | undefined {
        return undefined;
    };

    protected constructor(){};

    abstract toString(): string;

    abstract valueOf(): T;

    toJSON(): {[key:string]: T} {
        return {value: this.valueOf()};
    }
}


export class DateDecorator extends AbstractDecorator<number> {
    #value: number;
    #locale: Intl.LocalesArgument;
    #options: Intl.DateTimeFormatOptions = {
        year: 'numeric',   // Forces full 4-digit year (e.g., 2026)
        month: '2-digit',
        day: '2-digit',
    };

    constructor(value: number, locale?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
        super();
        this.#value = value;
        this.#locale = locale ?? this.#locale;
        this.#options = options ?? this.#options;
    }

    toString(): string {
        const v = this.valueOf();
        return this.#locale === undefined
            ? toISODateString(v)
            : new Date(v).toLocaleString(this.#locale, this.#options);
    }

    valueOf(): number {
        return this.#value;
    }

    get value(): number {
        return this.#value;
    }

    get locale(): Intl.LocalesArgument {
        return this.#locale;
    }
}


export class DateTimeDecorator extends DateDecorator {

    #options: Intl.DateTimeFormatOptions = {
        year: 'numeric',   // Forces full 4-digit year (e.g., 2026)
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    constructor(value: number, locale?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
        super(value, locale);
        this.#options = options  ?? this.#options;
    }

    toString(): string {
        const dt = new Date(this.valueOf());
        return this.locale !== undefined
            ? dt.toLocaleString(this.locale, this.#options)
            : dt.toISOString()
    }
}

export class NumberDecorator extends AbstractDecorator<number> {
    #value: number;
    #locale: Intl.LocalesArgument;
    #scale: number = 2;

    constructor(value: number, scale?: number, locale?: Intl.LocalesArgument) {
        super();
        this.#value = value;
        this.#locale = locale ?? this.#locale;
        this.#scale = scale ?? this.#scale;
    }

    toString(): string {
        const v =  this.valueOf().toFixed(this.#scale);
        return this.#locale ? v.toLocaleString() : String(v);
    }

    valueOf(): number {
        return this.#value;
    }
}


export class CurrencyDecorator extends NumberDecorator{
    #scale: number = 2;
    #format: string = "USD";
    #locale: Intl.LocalesArgument = "en-US`"

    constructor(value: number, locale: Intl.LocalesArgument = "en-US", format?: string, scale?: number) {
        super(value, scale);
        this.#scale = scale ?? this.#scale;
        this.#locale = locale ?? this.#locale;
        this.#format = format ?? this.#format;
    }

    toString(): string {
        return `${this.valueOf().toLocaleString(this.#locale, {
            style: "currency",
            currency: this.#format,
            maximumFractionDigits: this.#scale,
            minimumFractionDigits: this.#scale,
        })}`;
    }
}

export class StringDecorator extends AbstractDecorator<string> {
    #value: string;

    constructor(value: string) {
        super();
        this.#value = value;
    }

    toString(): string {
        return this.valueOf();
    }

    valueOf(): string {
        return this.#value;
    }
}

export class BooleanDecorator extends AbstractDecorator<boolean> {
    #value: boolean;

    constructor(value: boolean) {
        super();
        this.#value = value;
    }

    toString(): string {
        return `${this.valueOf()}`;
    }

    valueOf(): boolean {
        return Boolean(this.#value);
    }
}