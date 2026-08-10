import StringRenderer from "./StringRenderer.tsx";
import NumericRenderer from "./NumericRenderer.tsx";
import DateRenderer from "./DateRenderer.tsx";
import BooleanRenderer from "./BooleanRenderer.tsx";
import type {ElementType} from "react";

const defaultRegistry:Record<string, ElementType> = {
    "string": StringRenderer,
    "number": NumericRenderer,
    "date": DateRenderer,
    "boolean": BooleanRenderer,
    /*
    object: StructRenderer,
    array: ArrayRenderer,
    map: MapRenderer,
    enum: EnumRenderer,
    */
}

 export class Registry {
    #renderers:Record<string, ElementType> = defaultRegistry;

    constructor(renderers?: Record<string, ElementType>) {
        if (renderers != null) {
            this.#renderers = renderers;
        }
    }

    getRenderer(type: string): ElementType {
        return this.#renderers[type] ?? StringRenderer
    }
}

export default new Registry();