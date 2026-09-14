import type {RefObject} from "react";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";
import ObservableList, {ListItem} from "../model/ObservableList.ts";

export type Consumer<T> = (value: T) => void;
export type BiConsumer<T, U> = (value1:T, value2:U) => void;
export type Operator<T> = (value:T) => T;
export type Predicate<T> = (value:T) => boolean;
export type Supplier<T> = () => T;
export type Adapter<T, R> = (value:T) => R;
export type BiFunction<T, U, R> = (value1:T, value2:U) => R;
export type Struct = Record<string | number | symbol, unknown>;
export type Coordinates = {rowIndex: number, colIndex: number};
/** @deprecated */
export type DataTypes =
    | "string"
    | "number"
    | "currency"
    | "date"
    | "datetime"
    | "boolean"
    | "object"
    | "array"
    | "map"
    | "enum";
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;
export type Collection = Map<unknown, unknown> | Set<unknown> | unknown[];

export interface Command {
    execute(): boolean;
    undo(): boolean,
    redo(): boolean,
    name?: string,
    readonly icon?: IconProp,
    readonly accelerator?: string,
}


interface ISelectionModel {
    getSelectedItem(): ListItem<Struct>,
    getSelectedItems(): ListItem<Struct>[],
}

export type ContextMenuParameter = {
    targetRef: RefObject<HTMLElement>,
    selectionModel: ISelectionModel,
    items: ObservableList<Struct>,
}

export type Role = "scrollbar"
    | "searchbox"
    | "separator"
    | "slider"
    | "switch"
    | "tab"
    | "tabpanel"
    | "treeitem"
    | "combobox"
    | "menu"
    | "menubar"
    | "tablist"
    | "tree"
    | "treegrid"
    | "dialog"
    | "main"
    | "region"
    | "navigation"
    | "search"
    | "form"
    | "toolbar"
    | "tooltip"
;



