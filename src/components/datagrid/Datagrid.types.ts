import type {ComponentPropsWithoutRef, RefObject} from "react";
import type {Command, Predicate, Struct} from "../../types/types.ts";
import type {ListItem} from "../../model/ObservableList.ts";
import type {DTO, DTOprops} from "../../model/dtos.ts";


export type EnhancedPanelProps<T> = Omit<ComponentPropsWithoutRef<'div'>, keyof T> & T;


/**
 * Type for Renderer props.
 * @typeParam T - the type of the field value passed to the render
 * @typeParam U - the type of the data row, the object contained in a row of data
 */
export type RendererProps<T = string | number | boolean, U extends Struct = Struct> = EnhancedInputProps<{
    /**
     * Boolean for whether the value should be rendered in an editable node (e.g. input)
     * or within a readonly DIV.
     */
    active?: boolean,
    value?: DTO<T>,
    /** The name of a property used to supply the value. */
    name: string,
    className?: string,
    /**
     * A function for validating the value. Executed during onChange events.
     * @returns {boolean} Whether the input value is valid.
     */
    validator?: Predicate<string>,
    format?: string | Intl.DateTimeFormatOptions,
    /** The list of options for autocompletes. If present, the renderer supports autocompletes. */
    items?: { [key: string]: string | number | boolean }[],
    /**
     * Whether the renderer accepts multiple values. This has an effect only on
     * renderers that support using multiple values.
     */
    multiple?: boolean,
    ref?: RefObject<HTMLInputElement | null>,
    /**
     * The entire data row, needed for things like compound field values.
     */
    row?: ListItem<U>,
    /** Used by numeric renderers */
    scale?: number,
    locale?: Intl.LocalesArgument,
    /** Whether text should wrap. */
    wrap?: boolean,
    /** Commands for the column's context menu. */
    contextMenuItems?: Command[],
    /**
     * Items for the column's DataLists.
     * Turns the cells in the column into autocomplete fields.
     */
    listItems?: string[],
    /**
     * Whether the value can be edited.
     * @default false
     */
    editable?: boolean,
    /** The initial width of the column. */
    width?: number,
    autoComplete?: boolean,
}>;


export type Configuration<T> = EnhancedPanelProps<T> & DTOprops & Omit<RendererProps, keyof T> & T;
export type EnhancedInputProps<T> = Omit<ComponentPropsWithoutRef<'input'>, keyof T> & T;


