import {
    type ReactElement,
    useContext,
    useEffect,
    useRef,
    type DragEvent,
    useCallback,
} from "react";
import type {BiFunction, Command, Struct} from "../../types/types";
import styles from "./DataGrid.module.css";
import {GridContext} from "./GridContext";
import type {DataTypes} from "../../types/types";
import SortButton from "./headers/SortButton";
import {MIN_COLUMN_WIDTH, SORT_DIRECTION_ASC, SORT_DIRECTION_DESC} from "./constants";
import ColumnResizer from "./headers/ColumnResizer";
import {joinCss} from "./../../util/utils";
import Pin from "./headers/Pin";
import type {EnhancedPanelProps, ValidatedInputProps} from "./renderers/renderers.types.ts";
import type {Newable} from "./renderers/typeInference.ts";
import type {Record} from "../../ObservableList.ts";

/**
 * Extends ColumnConfigurableProps so that the GridCell can be configured from the TableColumn.
 * @augmentsRendererProps
 * @typeParam V - the data type of the values contained in the column.
 */
export type TableColumnProps<V = unknown> = EnhancedPanelProps<{
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
    renderer?: (props: ValidatedInputProps) => ReactElement,
    decorator?: Newable<any, any>,
    /**
     * Used to customize the header
     * @todo
     */
    headerRenderer?: ReactElement,
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
    /** The HTML title attribute */
    title?: string,
    wrap?: boolean,
    width?: number,
    cellFactory?: (props: TableColumnProps<V>, index: number, rowIndex: number, row: Record) => ReactElement,
    validator?: (value: string) => boolean,
    required?: boolean,
    contextMenuItems?: Command[],
    locale?: Intl.LocalesArgument,
    format?: string,
}>;


/**
 * Creates column headers and configures cells in its column.  This is the primary interface for
 * configuring cells.
 *
 * @param props {TableColumnProps}
 * @constructor
 */
export default function TableColumn<T extends Struct>(props: TableColumnProps<T>): ReactElement {
    const {
        text,
        name,
        sortable = true,
        resizable = true,
        wrap = false,
        title = true,
        sticky = false,
        type,
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const gridContext = useContext(GridContext);
    const {
        gridDispatch,
        stickyHeaders,
        sortColumns,
        pinned,
    } = gridContext;
    const focusModel = gridContext.focusModel?.current;
    const selectionModel = gridContext.selectionModel?.current;
    const active = sortColumns?.[0] === name;
    let sortDirection = gridContext.sortDirection;
    const mounted = useRef(false);

    if (sticky && !mounted.current) {
        gridContext.pinned.add(name);
    }

    const findOffset = () => {
        const el = ref.current;
        if (el == null) return;

        let offset = 0;
        const prev = el.previousElementSibling;
        if (prev instanceof HTMLElement) {
            offset += Number(prev.getAttribute("data-offset"));
            offset += prev.offsetWidth;
        }

        el.style.left = `${offset}px`;
        el.setAttribute("data-offset", String(offset));
        return offset;
    }


    // ========================================== Effects
    useEffect(() => {
        mounted.current = true;
    }, [])


    /*
    Resets column widths and offsets in response changes that cause re-renders.
     */
    useEffect(() => {
        const offset = findOffset();
        if (offset != null) {
            gridContext.offsets.set(name, offset);
        }
        const width = gridContext.columnWidths.get(name);
        if (ref.current != null) {
            if (width != null) ref.current.style.width = `${width}px`;
        }
    }, [
        gridContext.pinned,
        gridContext.sortColumns,
        gridContext.sortDirection,
        gridContext.columnWidths.values(),
    ]);


    // =========================================== Event handlers
    const updatePin = useCallback(
        () => {
            const pushed = !pinned.has(name)
            const el = ref.current;
            if (el != null && pushed) {
                gridDispatch?.({type: "pin", payload: {name}});
            } else if (el != null && !pushed) {
                gridDispatch?.({type: "unpin", payload: {name}});
            }
        },
        [pinned, gridDispatch, ref.current],
    );


    const onSortClicked = () => {
        if (gridDispatch == null) return;
        if (sortColumns?.[0] !== name) {
            gridDispatch({type: "sort", payload: {name}});
        } else if (sortDirection === SORT_DIRECTION_ASC) {
            sortDirection = SORT_DIRECTION_DESC;
        } else {
            sortDirection = SORT_DIRECTION_ASC;
        }
        gridDispatch({
            type: "reverseSort",
            payload: {name, value: String(sortDirection)}
        });
    }

    const colIndex = gridContext.columns
        .findIndex(col => (col.props as TableColumnProps<T>).name === name);

    const handleResize = (delta: number) => {
        if (ref.current != null) {
            const width = ref.current.offsetWidth;
            let newWidth = width + delta;
            newWidth = newWidth < MIN_COLUMN_WIDTH ? MIN_COLUMN_WIDTH : newWidth;
            ref.current.style.width = `${newWidth}px`;
            gridContext.columnWidths.set(name, newWidth);
            gridDispatch?.({type: "update"});
        }
    }

    const clear = useCallback(
        () => {
            focusModel?.clear();
            selectionModel?.clearSelections();
        },
        [focusModel, selectionModel],
    );

    // ===================================== Rendering
    return  (
        <div
            ref={ref}
            onFocus={clear}
            onMouseDown={clear}
            onDragOver={onDragOver}
            className={joinCss(
                styles.header,
                !wrap ? styles.nowrap : "",
                resizable ? styles.resizable : "",
                stickyHeaders ? styles.stickyHeaders : "",
                gridContext.pinned.has(name) ? styles.stickyColumn : "",
                gridContext.pinned.size - 1 === colIndex ? styles.divider : "",
                type != null && styles[type] ? styles[type] : "",
            )}
            data-col-index={colIndex}
        >
            <div
                className={styles.title}
                onClick={sortable ? onSortClicked : undefined}
            >
                <span title={title ? text : undefined}>{text}</span>
                {sortable ? <SortButton active={active} sortDirection={sortDirection} /> : ""}
            </div>
            <Pin
                active={pinned.has(name)}
                onClick={() => updatePin()}
            />
            {resizable ? (
                <ColumnResizer
                    onResize={handleResize}
                    className={(ref.current?.offsetWidth ?? Number.POSITIVE_INFINITY) <= MIN_COLUMN_WIDTH
                        ? styles.tooSmall
                        : (ref.current?.offsetWidth ?? MIN_COLUMN_WIDTH) >= 300 ? styles.tooLarge : ""}
                />
            ) : ""}
        </div>
    );
}



/* ============================================ Private */
function onDragOver(e: DragEvent): void {
    e.preventDefault();
}

