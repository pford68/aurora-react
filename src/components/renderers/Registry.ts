import StringRenderer from "./StringRenderer.tsx";
import NumericRenderer from "./NumericRenderer.tsx";
import DateRenderer from "./DateRenderer.tsx";
import BooleanRenderer from "./BooleanRenderer.tsx";
import type {ComponentType, ElementType} from "react";
import withReadonlyMode from "./withReadonlyMode.tsx";
import type {RendererProps} from "./types.ts";

const defaultRegistry:Record<string, ElementType> = {
    "string": withReadonlyMode(StringRenderer as ComponentType<any>),
    "number": withReadonlyMode(NumericRenderer as ComponentType<any>),
    "date": DateRenderer,
    "boolean": withReadonlyMode(BooleanRenderer as ComponentType<any>),
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
        return (this.#renderers[type] ?? this.#renderers["string"]) as ComponentType<RendererProps<any>>;
    }
}

export default new Registry();