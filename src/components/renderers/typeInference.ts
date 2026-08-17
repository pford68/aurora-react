import {
    AbstractDecorator,
    BooleanDecorator,
    CurrencyDecorator,
    DateDecorator,
    NumberDecorator,
    StringDecorator,
} from "./decorators.ts";


type Newable<T, V extends AbstractDecorator<T>> = new (value: T) => V;

export function getDecoratorByType<T, V extends AbstractDecorator<T>>(value: T, type?: string): Newable<T, V> {
    const key = type ?? (value?.constructor.name != null ? String(value.constructor.name) : null) ?? typeof value;
    switch(key?.toLowerCase()) {
        case "date":
            return DateDecorator as unknown as Newable<T, V>;
        case "currency":
            return CurrencyDecorator as unknown as Newable<T, V>;
        case "number":
            return NumberDecorator as unknown as Newable<T, V>;
        case "boolean":
            return BooleanDecorator as unknown as Newable<T, V>;
        default:
            return StringDecorator as unknown as Newable<T, V>;
    }
}
