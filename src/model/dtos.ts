import {toISODateString} from "../util/utils.ts";


/**
 * @typeParam T - the data type of the value contained in the DTO
 */
export interface DTO<T = string | number | boolean | undefined> {
    /** The string to represent the value when it renders */
    toString(): string;

    valueOf(): T;

    toJSON(): { [key: string]: T };

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
    protected get format(): string | undefined {
        return undefined;
    };

    protected constructor(){};
    abstract toString(): string;
    abstract valueOf(): T;
    abstract clone(value: T): DTO;
    abstract readonly formType: string;

    toJSON(): {[key:string]: T} {
        return {value: this.valueOf()};
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
        super();
        this.#value = Number(value);
        if (options != null) {
            const {locale} = options;
            this.#locale = locale ?? this.#locale;
        }
    }

    toString(): string {
        const v = this.valueOf();
        return this.#locale === undefined
            ? toISODateString(v)
            : new Date(v).toLocaleString(this.#locale, this.#format);
    }

    valueOf(): number {
        return this.#value;
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

    toString(): string {
        return new Date(this.valueOf()).toISOString();
    }

    get formType(): string {
        return this.#formType;
    }
}

export class NumberDTO extends AbstractDTO<number> {
    #value: number;
    #scale: number = 2;
    #formType: string = "number";

    constructor(value: number, options?: DTOprops) {
        super();
        this.#value = Number(value);
        if (options != null) {
            const {scale} = options
            this.#scale = scale ?? this.#scale;
        }
    }

    toString(): string {
        const v =  this.valueOf().toFixed(this.#scale);
        return v.toLocaleString();
    }

    valueOf(): number {
        return Number(this.#value);
    }

    clone(value: number): DTO {
        const config = {
            formType: this.#formType as "number",
            scale: this.#scale,
        }
        return new NumberDTO(value, config);
    }

    get formType(): string {
        return this.#formType;
    }
}


export class CurrencyDTO extends NumberDTO{
    #scale: number = 2;
    #format: string = "USD";
    #locale: Intl.LocalesArgument = "en-US";

    toString(): string {
        return `${this.valueOf().toLocaleString(this.#locale, {
            style: "currency",
            currency: this.#format,
            maximumFractionDigits: this.#scale,
            minimumFractionDigits: this.#scale,
        })}`;
    }

    valueOf(): number {
        const value = super.valueOf();
        return !isNaN(value) ? value : 0;
    }
}


export class StringDTO extends AbstractDTO<string> {
    #value: string = "";
    #formType: string = "text";

    constructor(value: string, options?: DTOprops) {
        super();
        if (value != null) this.#value = value;
        if (options != null) {
            const {formType} = options
            this.#formType = formType ?? this.formType;
        }
    }

    toString(): string {
        return this.valueOf();
    }

    valueOf(): string {
        return this.#value;
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
}

export class BooleanDTO extends AbstractDTO<boolean> {
    #value: boolean;
    #formType: string = "text";

    constructor(value: boolean, options?: DTOprops) {
        super();
        this.#value = String(value) === "true";
        if (options != null) {
            const {formType} = options;
            this.#formType = formType ?? this.formType;
        }
    }

    toString(): string {
        return `${this.valueOf()}`;
    }

    valueOf(): boolean {
        return Boolean(this.#value);
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
}

