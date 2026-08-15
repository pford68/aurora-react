import type {
    RefObject, ComponentPropsWithoutRef, ReactElement
} from "react";
import type {Command, Predicate, Struct} from "../../types/types.ts";

/**
 * Type for Renderer props.
 * @typeParam T - the type of the field value passed to the render
 * @typeParam U - the type of the data row, the object contained in a row of data
 */
export type RendererProps<T, U extends Struct = Struct> = ComponentPropsWithoutRef<"input"> & {
    /**
     * Boolean for whether the value should be rendered in an editable node (e.g. input)
     * or within a readonly DIV.
     */
    active: boolean,
    /**
     * The unformatted value to be displayed by the renderer.
     */
    value?: T,
    /** The name of a property used to supply the value. */
    name: string,
    className?: string,
    /**
     * A function for validating the value. Executed during onChange events.
     * @returns {boolean} Whether the input value is valid.
     */
    validator?: Predicate<T>,
    format?: string,
    /** The list of options for autocompletes. If present, the renderer supports autocompletes. */
    items?: {[key: string] :T}[],
    /**
     * Whether the renderer accepts multiple values. This has an effect only on
     * renderers that support using multiple values.
     */
    multiple?: boolean,
    rendererRef?: RefObject<HTMLInputElement | null>,
    /**
     * The entire data row, needed for things like compound field values.
     */
    row?: U,
    /** Used by numeric renderers */
    precision?: number,
    /** Whether text should wrap. */
    wrap?: boolean,
    /** Commands for the column's context menu. */
    contextMenuItems?: Command<Struct>[],
    /**
     * Items for the column's DataLists.
     * Turns the cells in the column into autocomplete fields.
     */
    listItems?: string[],
    valueChanged?: (value: T) => void,
    /**
     * Whether the value can be edited.
     * @default false
     */
    editable: boolean,
    /** The initial width of the column. */
    width?: number,
};

/**
 * @typeParam T - the type for the data row, the object contained in a row of data, required by RendererProps
 * @typeParam V - the type for the value to be rendered
 */
export interface Renderer<T extends Struct, V>{
    /** The string to represent the value when it renders */
    toString(): string;
    /**
     * The value contained in the renderer.  In the case of a Date,
     * this would be the timestamp as a number.
     */
    value(): V;
    /**
     * The component to render in edit mode.  The DOM should be
     * so simple in read mode that the cell factory handles that
     * internally using toString().
     */
    render(props: RendererProps<V, T>): ReactElement;
    validate(): boolean,
}
