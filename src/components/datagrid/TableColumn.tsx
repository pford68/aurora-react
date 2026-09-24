import {type ReactElement, } from "react";
import type {BiFunction} from "../../types/types";
import type {DataTypes} from "../../types/types";
import type {Configuration, RendererProps} from "./Datagrid.types.ts";
import type {DataGridEntry} from "./Datagrid.types.ts";
import type {HeaderProps} from "./Header.tsx";


/**
 * Extends ColumnConfigurableProps so that the GridCell can be configured from the TableColumn.
 * @augmentsRendererProps
 * @typeParam V - the data type of the values contained in the column.
 */
export type TableColumnProps<V = unknown> = Configuration<{
    name: string,
    /**
     * Whether the column is sortable.
     * @default false
     */
    sortable?: boolean,
    /**
     * Whether to render the column initially.
     * @default true
     */
    visible?: boolean,
    /**
     * Whether the column is initially pinned.
     * @default false
     */
    sticky?: boolean,
    /**
     * A custom sort function.
     * Use cases include values that are complex objects and sorting by multiple columns
     */
    comparator?: BiFunction<V, V, number>,
    /**
     * The data type of the values in the column.
     * Must be one of the registered types or will revert to string.
     */
    type?: DataTypes,
    /** The header text. Defaults to the value of the name prop. */
    text?: string,
    renderer?: (props: RendererProps) => ReactElement,
    /**
     * Used to customize the header
     * @todo
     */
    headerRenderer?: (props: HeaderProps) => ReactElement,
    headerClassName?: string,
    /**
     * For showing the full header text if abbreviated.
     * @todo
     */
    altText?: string,
    /**
     * Adds the column with a column group.
     * @todo
     */
    group?: string | string[],
    resizable?: boolean,
    /**
     * Handler for custom resize events.
     * @todo
     */
    onResize?: (colName: string, delta: number) => void,
    wrap?: boolean,
    width?: number,
    cellFactory?: (props: TableColumnProps<V>, index: number, rowIndex: number, row: DataGridEntry<string | boolean | number>) => ReactElement,
    validator?: (value: string) => boolean,
    required?: boolean,
    contextMenuItems?: ReactElement[],
    format?: string,
    editable?: boolean,
}>;


/**
 * Configures cells in a column.
 *
 */
// @ts-expect-error no-unused-vars
export default function TableColumn<V = unknown>(props: TableColumnProps<V>): null {
    return null;
}