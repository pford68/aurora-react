import type {RefObject, ComponentPropsWithoutRef} from "react";
import type {Predicate} from "../../../types/types";

export type BaseRendererProps<T> = ComponentPropsWithoutRef<"input"> & {
    /**
     * Boolean for whether the value should be rendered in an editable node (e.g. input)
     * or within a readonly DIV.
     */
    active: boolean,
    /**
     * The unformatted value to be displayed by the renderer.
     */
    value?: unknown,
    /** The name of a property used to supply the value. */
    name: string,
    className?: string,
    /**
     * A function for validating the value. Executed during onChange events.
     * @returns {boolean} Whether the input value is valid.
     */
    validator?: Predicate<T | string | unknown>,
    format?: string,
    /** The list of options for autocompletes. If present, the renderer supports autocompletes. */
    items?: {[key: string] :T}[],
    /**
     * Whether the renderer accepts multiple values. This has an effect only on
     * renderers that support using multiple values.
     */
    multiple?: boolean,
    rendererRef?: RefObject<HTMLInputElement | null>,
};

