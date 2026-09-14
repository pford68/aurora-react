import {BooleanDTO, type DTO, type DTOprops, NumberDTO, StringDTO,} from "../../model/dtos.ts";

export function getDecoratorInstance(value: number | string | boolean, options?: DTOprops): DTO<number | string | boolean> {
    const key = (value?.constructor.name != null ? String(value.constructor.name) : null) ?? typeof value;
    switch(key?.toLowerCase()) {
        case "number":
            return new NumberDTO(value, options);
        case "boolean":
            return new BooleanDTO(value, options)
        default:
            return new StringDTO(value, options);
    }
}
