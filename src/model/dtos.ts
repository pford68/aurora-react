import {toISODateString} from "../util/utils.ts";


/**
 * @typeParam T - the data type of the value contained in the DTO
 */
export interface DTO<T = string | number | boolean | undefined> {
    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean;
    toJSON(): { [key: string]: T  | undefined};
    clone(value: T | null): DTO
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
    #value: T | undefined;
    #formType: string;

    protected constructor(value?: T, options?: DTOprops) {
        this.#value = value;
        this.#formType = options?.formType ?? "string";
    }
    abstract [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean;
    abstract clone(value: T): DTO;

    get value(): T | undefined {
        return this.#value;
    }

    get formType(): string {
        return this.#formType;
    }

    protected get format(): string | undefined {
        return undefined;
    };

    toJSON(): {[key:string]: T | undefined} {
        return {value: this.value};
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

    constructor(value: number, options?: DTOprops) {
        super(value, options);
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
        return new DateDTO(v, config);
    }

    get value(): number {
        return this.#value;
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

    constructor(value: number, options?: DTOprops) {
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

    constructor(value?: number, options?: DTOprops) {
        super(value, options);
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
        }
        return new NumberDTO(value, config);
    }

    get value(): number {
        return this.#value;
    }
}


export class CurrencyDTO extends NumberDTO{
    #scale: number = 2;
    #format: string = "USD";
    #locale: Intl.LocalesArgument = "en-US";

    constructor(value?: number, options?: DTOprops) {
        super(value, options);
    }

    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean {
        const value = this.value;

        switch (hint) {
            case "string":
                if (isNaN(value)){
                    return "$0.00";
                }
                return `${value.toLocaleString(this.#locale, {
                    style: "currency",
                    currency: this.#format,
                    maximumFractionDigits: this.#scale,
                    minimumFractionDigits: this.#scale,
                })}`;
            case "number":
            case "default":
            default:
                if (isNaN(value)){
                    return 0;
                }
                return value;
        }
    }
}


export class StringDTO extends AbstractDTO<string> {
    #value: string = "";
    #formType: string = "text";

    constructor(value?: string, options?: DTOprops) {
        super(value, options);
        if (value != null) this.#value = value;
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
}

export class BooleanDTO extends AbstractDTO<boolean> {
    #value: boolean;
    #formType: string = "text";

    constructor(value?: boolean, options?: DTOprops) {
        super(value, options);
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
}

