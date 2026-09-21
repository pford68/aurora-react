import {toISODateString} from "../util/utils.ts";


/**
 * @typeParam T - the data type of the value contained in the DTO
 */
export interface DTO<T = string | number | boolean | undefined> {
    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean;
    toJSON(): T | undefined;
    clone(value: T | null): DTO;
    valueOf(): T | undefined;
    value: T | undefined;
    readonly formType: string;
}

export type DTOprops = {
    format?: string | Intl.DateTimeFormatOptions,
    locale?: Intl.LocalesArgument,
    /** The type value to send to HTML input elements. */
    formType?: "text" | "number" | "date" | "password"
        | "tel" | "email" | "checkbox" | "switch" | "radio"
        | "color" | "file" | "range" | "search",
    scale?: number,
}

/**
 * @typeParam T - the data type of the value contained in the DTO
 */
export abstract class AbstractDTO<T> implements DTO<T> {
    protected constructor() {}
    abstract [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean;
    abstract clone(value: T): DTO;
    abstract get value(): T | undefined;
    abstract valueOf(): T | undefined;
    abstract get formType(): string;

    toJSON(): T | undefined{
        return this.value;
    }

    protected create(value?: T, config?: DTOprops): this {
        const Constructor = this.constructor as new (value?: unknown, options?: DTOprops) => this;
        return new Constructor(value, config);
    }
}


export class DateDTO extends AbstractDTO<number> {
    #value: number;
    #locale: Intl.LocalesArgument;
    #format: Intl.DateTimeFormatOptions = {
        year: 'numeric',   // Forces full 4-digit year (e.g., 2026)
        month: '2-digit',
        day: '2-digit',
    };
    #formType = "date";

    constructor(value: unknown, options?: DTOprops) {
        super();
        this.#value = Number(value);
        if (options != null) {
            const {locale} = options;
            this.#locale = locale ?? this.#locale;
        }
    }

    [Symbol.toPrimitive](hint: string | number | boolean | "default"): string | number | boolean {
        const value = this.#value;

        switch (hint) {
            case "string":
                return this.#locale === undefined
                    ? toISODateString(value)
                    : new Date(value).toLocaleString(this.#locale, this.#format);
            case "number":
            case "default":
            default:
                return value;
        }
    }

    clone(value: number): DTO {
        let v = value;
        if (isNaN(Number(value))) {
            v = Date.parse(String(value));
        }

        const config = {
            formType: this.#formType as "date",
            locale: this.#locale,
            format: this.#format,
        }

        return this.create(v, config);
    }

    get value(): number {
        return this.#value;
    }

    valueOf(): number {
        return this.#value;
    }

    get formType(): string {
        return this.#formType;
    }
}


export class DateTimeDTO extends DateDTO {
    #formType: string = "datetime-local";
    #format: Intl.DateTimeFormatOptions = {
        year: 'numeric',   // Forces full 4-digit year (e.g., 2026)
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    constructor(value: unknown, options?: DTOprops) {
        super(value, options);
        if (options != null) {
            const {format, formType} = options;
            if (typeof format !== "string") {
                this.#format = format ?? this.#format;
            }
            this.#formType = formType ?? this.#formType;
        }
    }

    [Symbol.toPrimitive](hint: string | number | boolean | "default"): string | number | boolean {
        const value = this.value;

        switch (hint) {
            case "string":
                return new Date(value).toISOString();
            case "number":
            case "default":
            default:
                return value;
        }
    }

}

export class NumberDTO extends AbstractDTO<number> {
    #value: number = Number.NaN;
    #scale: number = 2;
    #formType: string = "number";

    constructor(value?: unknown, options?: DTOprops) {
        super();
        this.#value = Number(value);
        if (options != null) {
            const {scale} = options
            this.#scale = scale ?? this.#scale;
        }
    }

    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean {
        const value = this.#value;

        switch (hint) {
            case "string":
                const v =  value.toFixed(this.#scale);
                return v.toLocaleString();
            case "number":
            case "default":
            default:
                return value;
        }
    }

    clone(value: number): DTO {
        const config = {
            formType: this.#formType as "number",
            scale: this.#scale,
        };
        return this.create(value, config);
    }

    get value(): number {
        return this.#value;
    }

    valueOf(): number {
        return this.#value;
    }

    get formType(): string {
        return this.#formType;
    }
}


export class CurrencyDTO extends NumberDTO{
    #scale: number = 2;
    #format: string = "USD";
    #locale: Intl.LocalesArgument = "en-US";

    constructor(value?: unknown, options?: DTOprops) {
        super(value, options);
    }

    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean {
        const value = !isNaN(this.value)  ? this.value : 0;

        switch (hint) {
            case "string":
                return `${value.toLocaleString(this.#locale, {
                    style: "currency",
                    currency: this.#format,
                    maximumFractionDigits: this.#scale,
                    minimumFractionDigits: this.#scale,
                })}`;
            case "number":
            case "default":
            default:
                return value;
        }
    }

    valueOf(): number {
        const value = super.valueOf();
        return !isNaN(value) ? value : 0;
    }
}


export class StringDTO extends AbstractDTO<string> {
    #value: string = "";
    #formType: string = "text";

    constructor(value?: unknown, options?: DTOprops) {
        super();
        if (value != null) this.#value = String(value);
        if (options != null) {
            const {formType} = options
            this.#formType = formType ?? this.formType;
        }
    }

    [Symbol.toPrimitive](hint: string | number | boolean | "default"): string | number | boolean {
        const value = this.#value;

        switch (hint) {
            case "string":
                return value;
            case "number":
            case "default":
            default:
                return value;
        }
    }

    clone(value: string): DTO {
        const config = {
            formType: this.#formType as "text",
        }
        return new StringDTO(value, config);
    }

    get formType(): string {
        return this.#formType;
    }

    get value(): string {
        return this.#value;
    }

    valueOf(): string {
        return this.#value;
    }
}


export class BooleanDTO extends AbstractDTO<boolean> {
    #value: boolean;
    #formType: string = "text";

    constructor(value?: unknown, options?: DTOprops) {
        super();
        this.#value = String(value) === "true";
        if (options != null) {
            const {formType} = options;
            this.#formType = formType ?? this.formType;
        }
    }

    [Symbol.toPrimitive](hint: string | number | boolean | "default"): string | number | boolean {
        const value = this.#value;

        switch (hint) {
            case "string":
                return `${this.value}`;
            case "number":
                return value === true ? 1 : 0;
            case "default":
            default:
                return value;
        }
    }

    clone(value: boolean): DTO {
        const config = {
            formType: this.#formType as "checkbox" | "switch" | "text",
        }
        return new BooleanDTO(value, config);
    }

    get formType(): string {
        return this.#formType;
    }

    get value(): boolean | undefined {
       return this.#value;
    }

    valueOf(): boolean | undefined {
        return this.#value;
    }
}

