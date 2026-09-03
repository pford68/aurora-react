import {
    AbstractDTO,
    BooleanDTO,
    CurrencyDTO,
    DateDTO,
    type DTOprops,
    NumberDTO,
    StringDTO,
} from "./dtos.ts";


export type Newable<T, V extends AbstractDTO<T>> = new (value: T, props?: DTOprops) => V;


export function getDecoratorByType<T, V extends AbstractDTO<T>>(value: T, type?: string): Newable<T, V> {

    const key = type ?? (value?.constructor.name != null ? String(value.constructor.name) : null) ?? typeof value;

    switch(key?.toLowerCase()) {
        case "date":
            return DateDTO as unknown as Newable<T, V>;
        case "currency":
            return CurrencyDTO as unknown as Newable<T, V>;
        case "number":
            return NumberDTO as unknown as Newable<T, V>;
        case "boolean":
            return BooleanDTO as unknown as Newable<T, V>;
        default:
            return StringDTO as unknown as Newable<T, V>;
    }
}
