import {type ReactElement, type KeyboardEvent, useReducer, useRef, useEffect} from "react";
import PageFactory from "./PageFactory";
import ObservableList, {Record} from "./../../ObservableList";
import type {Command, Struct} from "../../types/types";
import styles from "./DataGrid.module.css";
import {joinCss} from "./../../util/utils";
import {GridContext} from "./GridContext";
import FocusModel from "./FocusModel";
import SelectionModel from "./SelectionModel";
import {SORT_DIRECTION_ASC} from "./constants";
import ColumnStyle from "./ColumnStyle";
import {CommandStack} from "../../util/CommandStack";
import {useStorageClipboard} from "../../hooks/useStorageClipboard.tsx";
import TableColumn, {type TableColumnProps} from "./TableColumn";
import ContextMenu from "../overlays/ContextMenu.tsx";
import GridRow from "./GridRow.tsx";
import GridCell from "./cells/GridCell.tsx";
import StatefulInput from "./renderers/StatefulInput.tsx";
import withPlaceholder from "./renderers/withPlaceholder.tsx";
import withReadonlyMode from "./renderers/withReadonlyMode.tsx";
import BooleanRenderer from "./renderers/BooleanRenderer.tsx";
import type {DTO, RendererProps} from "./renderers/renderers.types.ts";
import type {AbstractDTO} from "./renderers/decorators.ts";
import {getDecoratorByType, type Newable} from "./renderers/typeInference.ts";


// ==================================== Private
function reducer(state: GridState, action: GridAction): GridState {
    const {type, payload} = action;
    const err = "Payload missing.This shouldn't happen.";
    switch (type) {
        case 'sort': {
            if (payload == null) {
                console.warn(`sort action: ${err}`);
                return state;
            }
            const sortColumns = [...state.sortColumns];
            sortColumns.pop();
            sortColumns.unshift(payload.name);
            return {...state, sortColumns};
        }
        case 'reverseSort':
            if (payload == null) {
                console.warn(`reverse sort action: ${err}`);
                return state;
            }
            return {...state, sortDirection: String(payload.value)};
        case 'undo': {
            const undoStack = state.undoStack.clone();
            const redoStack = state.redoStack.clone();
            const cmd = undoStack?.pop();
            cmd?.undo();
            if (cmd != null) redoStack.push(cmd);
            return {...state, undoStack, redoStack};
        }
        case 'redo': {
            const undoStack = state.undoStack.clone();
            const redoStack = state.redoStack.clone();
            const cmd = redoStack?.pop();
            cmd?.redo();
            if (cmd != null) undoStack.push(cmd);
            return {...state, undoStack, redoStack};
        }
        case "pin": {
            const {payload} = action;
            if (payload != null) {
                const {pinned} = state;
                pinned.add(payload.name);
                return {...state, pinned: new Set(pinned)};
            }
            return state;
        }
        case "unpin": {
            const {payload} = action;
            if (payload != null) {
                const {pinned} = state;
                pinned.delete(payload.name);
                return {...state, pinned: new Set(pinned)};
            }
            return state;
        }
        case "update": {
            return {...state, lastUpdated: new Date().getTime()}
        }
        case "fitContainer": {
            return {...state, fitContainer: true};
        }
        default:
            throw new Error();
    }
}

function getDecoratorInstance<T, V extends AbstractDTO<T>>(value: T, type?: string, prop?: Newable<T, V>): DTO<T> {
    const decorator = prop ?? getDecoratorByType(value, type);
    return new decorator(value);
}

function defaultCellRenderer(props: RendererProps) {
    const {value} = props;
    if (typeof value?.valueOf() === "boolean") {
        return <BooleanRenderer {...props} value={value}/>
    }
    return <StatefulInput {...props} value={value?.valueOf()} ref={props.ref}/>
}


function cellFactoryProvider<T extends Struct>(columnConfig: TableColumnProps, index: number, rowIndex: number, row: Record<T>){
    const {renderer = defaultCellRenderer, cellFactory, type, decorator, name} = columnConfig;

    if (cellFactory != null) {
        return (() => cellFactory(columnConfig, index, rowIndex, row))();
    }

    const value = row.get(name);

    // Default cell factory
    const dto = getDecoratorInstance(value, type, decorator);

    if (dto === undefined) {
        throw new Error(`Decorator not found: props = ${name}, ${value}`);
    }
    return (
        <GridCell
            {...columnConfig}
            renderer={withPlaceholder(withReadonlyMode(renderer))}
            key={`${rowIndex}:${index}`}
            row={row}
            rowIndex={rowIndex}
            colIndex={index}
            dto={dto}
        />
    )
}


function defaultRowFactory<T extends Struct>(row: Record<T>, rowIndex: number) {
    return (
        <GridRow
            key={rowIndex}
            rowIndex={rowIndex}
            row={row}
            cellFactory={cellFactoryProvider}
        />
    );
}

function defaultComparator(a: unknown, b: unknown) {
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }
    return String(a).localeCompare(String(b));
}


export type DataGridProps = {
    /**
     * The data to display in the grid.
     */
    data: ObservableList<Struct>,
    /**
     * TableColumns and TableFooters are allowed.
     */
    children: ReactElement<TableColumnProps> | ReactElement<TableColumnProps>[],
    /**
     * Whether to use alternate row colors.
     * @default false
     */
    alternateRows: boolean,
    stickyHeaders: boolean,
    /**
     * Whether a cell can be nulled-out.  If false, empty strings cannot be saved.
     *
     * @default false
     */
    nullable: boolean,
    /**
     * The height of a row (in pixels) in the grid.
     * @type number
     * @default 48
     */
    rowHeight: number,
    /**
     * The number of rows in a page of data. It is used for virtualization.
     * @default 15
     */
    pageSize: number,
    /**
     * <p>Used for auto-sizing columns:  setting the widths of columns that don't have a
     * <i>width</i> prop set.  The choices are: <br />
     * <ul>
     *     <li><i>auto</i>: width is determined by the longest value/header on the first page of data.
     *     For columns where the headers are longer than their values, the headers wain.</li>
     *     <li><i>equal</i>: the spaces is divided equally between columns (that don't have width props set).</li>
     *     <li><i>max-content</i>: width is determined by the longest value in the first page of data..</li>
     * </ul>
     * </p>
     */
    columnSizing: "auto" | "equal" | "max-content",
    className?: string,
    /**
     * The initial sort column.
     */
    sortColumn?: string,
    /**
     * @todo
     */
    secondarySort?: boolean,
    /**
     * A list of Commands that will be used to crete a contextmenu.
     * This is both necessary and sufficient
     */
    contextMenuItems?: Command<Struct>[],
    height?: number,
    width?: number,
    resizable?: boolean,
    border?: boolean,
    contained?: boolean,
    rowFactory?: (row: Record<Struct>, rowIndex: number) => ReactElement,
};


export type GridState = {
    sortColumns: string[],
    sortDirection: string,
    undoStack: CommandStack,
    redoStack: CommandStack,
    pinned: Set<string>,
    lastUpdated: number,
    fitContainer: boolean,
};

export type GridAction = {
    type: "sort" | "reverseSort" | "resize" | "undo" | "redo" | "pin" | "unpin" | "update" | "fitContainer",
    payload?: { name: string, value?: unknown },
}

/**
 * <p>Just another datagrid.</p>
 *
 * <p>Supports:
 *    <ul>
 *        <li>Large datasets</li>
 *        <li>Cell editing</li>
 *        <li>Sortable columns</li>
 *        <li>Secondary sort</li>
 *        <li>Resizable columns</li>
 *        <li>Sticky headers and columns</li>
 *        <li>Key navigation</li>
 *        <li>Adding/removing rows</li>
 *        <li>Showing/hiding columns</li>
 *        <li>Dragging columns</li>
 *    </ul>
 * </p>
 *
 * @param props
 * @constructor
 */
export default function DataGrid(props: DataGridProps): ReactElement {
    const {
        data,
        className,
        stickyHeaders = true,
        nullable = false,
        alternateRows = false,
        columnSizing,
        rowHeight = 48, // TODO: Sync with grid-template rows,
        pageSize = 15,
        children,
        contextMenuItems,
        height,
        width,
        resizable = false,
        border = true,
        contained = true,
        rowFactory,
    } = props;

    //const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null)

    /*
    const containerRefCallback = useCallback((node: HTMLElement | null) => {
        if (node !== null) {
            setContainerNode(node); // Save the actual DOM node to state
        }
    }, []);*/
    const containerWidth: number = 0;
    const gridRef = useRef<HTMLDivElement>(null);

    //================================== Get visible columns once per render.
    const getVisibleColumns = (children: ReactElement<TableColumnProps> | ReactElement<TableColumnProps>[]) => {
        const childArray = Array.isArray(children) ? children : [children];
        return childArray
            .filter(child => child.type === TableColumn);
    }


    const visibleColumns: ReactElement<TableColumnProps>[]  = getVisibleColumns(children);
    const getMaxColumnWidth = () => ((containerWidth ?? 0) / visibleColumns.length)

    //=================================== State
    const rowCount = data.length;
    const selectionModel = useRef(new SelectionModel(data));
    const focusModel = useRef(new FocusModel(rowCount, visibleColumns.length));
    const initSortColumn = props.sortColumn ?? visibleColumns[0].props.name;
    const initialGridState: GridState = {
        sortColumns: [initSortColumn],
        sortDirection: SORT_DIRECTION_ASC,
        undoStack: new CommandStack(),
        redoStack: new CommandStack(),
        pinned: new Set<string>(),
        lastUpdated: new Date().getTime(),
        fitContainer: false,
    }

    const [state, gridDispatch] = useReducer(reducer, initialGridState);

    //====================================== Effects
    useStorageClipboard();

    useEffect(() => {
        if (rowCount != focusModel.current.rowCount) {
            focusModel.current.rowCount = data.length;
        }
        if (visibleColumns.length != focusModel.current.columnCount) {
            focusModel.current.columnCount = visibleColumns.length;
        }
    }, [
        data.length,
        visibleColumns,
        rowCount
    ]);


    //====================================== Event handlers
    const onKeyDown = (e: KeyboardEvent) => {
        const ctrlKey = e.ctrlKey || e.metaKey;
        switch (e.key) {
            case "y": {
                if (ctrlKey) {
                    e.stopPropagation();
                    e.preventDefault();  // cmd-y opens bookmarks in Chrome
                    gridDispatch({type: "redo"});
                }
                break;
            }
            case "z": {
                if (ctrlKey) {
                    gridDispatch({type: "undo"});
                }
                break;
            }
        }
    }

    //====================================== Rendering
    const wrappedComparator = (a: Record<Struct>, b: Record<Struct>): number => {
        const sortColumn = visibleColumns
            .find(col => col.props.name === state.sortColumns[0]);
        if (sortColumn == null) return 0;
        const {comparator = defaultComparator, name} = sortColumn.props;
        return state.sortDirection === SORT_DIRECTION_ASC
            ? comparator?.(a.get(name), b.get(name))
            : comparator?.(b.get(name), a.get(name));
    }

    // Sort data during render, the sort column's comparator.
    if (state.sortColumns.length > 0) {
        data.sort(wrappedComparator);
    }

    // Sorting columns based stickiness during render
    visibleColumns.sort((a, b) => {
        const {pinned} = state;
        const aName = a.props.name;
        const bName = b.props.name;
        return pinned.has(aName) && !pinned.has(bName) ? -1 :
            (!pinned.has(aName) && pinned.has(bName) ? 1 : 0);
    });

    const columnWidths = useRef(new Map(visibleColumns.map(col => [col.props.name, col.props.width])))
    const finalColumnSizing = columnSizing && !state.fitContainer ? columnSizing : "equal";

    return (
        <GridContext.Provider value={{
            ...state,
            gridRef,
            gridDispatch,
            items: data,
            columns: visibleColumns,
            columnWidths: columnWidths.current,
            offsets: new Map(),
            selectionModel,
            focusModel,
            stickyHeaders,
            nullable,
            columnSizing,
            alternateRows,
            contextMenuItems,
        }}>
            <ColumnStyle
                type={finalColumnSizing == "auto" || finalColumnSizing == "equal" ? finalColumnSizing : "auto"}
                columns={visibleColumns}
                maxWidth={getMaxColumnWidth()}
            />
            <div
                ref={containerRef}
                className={joinCss(
                    styles.container,
                    resizable ? styles.resizable : "",
                    border === true && contained ? styles.border : styles.borderless,
                    !contained ? styles.containerless : "",
                    className
                )}
                style={{height: `${height}px`, width: `${width != null ? `${width}px` : "auto"}`}}
            >
                <div
                    ref={gridRef}
                    className={joinCss(
                        styles.grid,
                        finalColumnSizing === "max-content" ? styles.columnSizing : "",
                        resizable && !contained? styles.resizable : "",
                        className
                    )}
                    onKeyDown={onKeyDown}
                >
                    <div
                        className={joinCss(
                            styles.row,
                            stickyHeaders ? styles.stickyHeaders : ""
                        )}
                        onContextMenuCapture={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {visibleColumns}
                    </div>
                    <PageFactory
                        data={data.getAll()}
                        root={containerRef}
                        offset={pageSize * rowHeight}
                        pageSize={8}
                        rowHeight={rowHeight}
                        rowFactory={rowFactory ?? defaultRowFactory}
                    />
                </div>
                {
                    contextMenuItems
                        ? (
                            <ContextMenu
                                commands={contextMenuItems}
                                targetRef={gridRef}
                            />
                        )
                        : ""
                }
            </div>
        </GridContext.Provider>
    )
}
