import type {RefObject, ComponentPropsWithoutRef} from "react";
import type {Command, Predicate, Struct} from "../../types/types.ts";

/**
 * Type for Renderer props.
 * @typeParam T - the type of the field value passed to the render
 * @typeParam U - the type of the data row, the object contained in a row of data
 */
export type RendererProps<T, U extends Struct> = ComponentPropsWithoutRef<"input"> & {
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
    format?: string | Intl.DateTimeFormatOptions,
    /** The list of options for autocompletes. If present, the renderer supports autocompletes. */
    items?: {[key: string] :T}[],
    /**
     * Whether the renderer accepts multiple values. This has an effect only on
     * renderers that support using multiple values.
     */
    multiple?: boolean,
    ref?: RefObject<HTMLInputElement | null>,
    /**
     * The entire data row, needed for things like compound field values.
     */
    row?: U,
    /** Used by numeric renderers */
    scale?: number,
    locale?: Intl.LocalesArgument,
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
 * @typeParam T - the data type of the value contained in the DTO
 */
export interface DTO<T>{
    /** The string to represent the value when it renders */
    toString(): string;
    valueOf(): T;
    toJSON(): {[key:string]: T};
    update(value: T): void
    readonly renderType: string;
}
