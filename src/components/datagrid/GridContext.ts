import {createContext, type Dispatch, type ReactElement, type RefObject} from "react";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import ObservableList from "../../model/ObservableList.ts";
import type {Struct} from "../../types/types";
import type {GridAction} from "./DataGrid";
import type {TableColumnProps} from "./TableColumn.tsx";

export type GridContextType = {
    items: ObservableList<Struct> | undefined,
    columns: TableColumnProps[],
    sortColumns: string[],
    sortDirection: string,
    alternateRows: boolean,
    pinned: Set<string>,
    columnWidths: Map<string, number | undefined>,
    columnSizing: "auto" | "equal" | "max-content",
    offsets: Map<string, number>,
    gridDispatch?: Dispatch<GridAction>,
    focusModel?: RefObject<FocusModel>,
    selectionModel?: RefObject<SelectionModel>,
    stickyHeaders?: boolean,
    nullable?: boolean,
    undoStack?: number,
    gridRef?: RefObject<HTMLDivElement | null>,
    contextMenuItems?: ReactElement[],
}
export const initialGridContext: GridContextType = {
    columns: [],
    sortColumns: [],
    sortDirection: "",
    items: undefined,
    stickyHeaders: true,
    nullable: true,
    pinned: new Set<string>(),
    offsets: new Map(),
    columnWidths: new Map(),
    columnSizing: "auto",
    alternateRows: false,
}
export const GridContext = createContext(initialGridContext);
