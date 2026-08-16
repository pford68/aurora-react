import StringRenderer from "./StringRenderer.tsx";
import NumberRenderer from "./NumberRenderer.tsx";
import DateRenderer from "./DateRenderer.tsx";
import BooleanRenderer from "./BooleanRenderer.tsx";
import type {ComponentType, ElementType} from "react";
import type {RendererProps} from "./types.ts";

const defaultRegistry:Record<string, ElementType> = {
    "string": StringRenderer,
    "number": NumberRenderer,
    "date": DateRenderer,
    "boolean": BooleanRenderer,
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