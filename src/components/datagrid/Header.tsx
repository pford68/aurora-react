import {type ReactElement, use, useEffect, useRef, type DragEvent} from "react";
import styles from "./DataGrid.module.css";
import {GridContext} from "./GridContext";
import SortButton from "./headers/SortButton";
import {MIN_COLUMN_WIDTH, SORT_DIRECTION_ASC, SORT_DIRECTION_DESC} from "./constants";
import ColumnResizer from "./headers/ColumnResizer";
import {joinCss} from "./../../util/utils";
import Pin from "./headers/Pin";
import type {RendererProps} from "./Datagrid.types.ts";
import type {TableColumnProps} from "./TableColumn.tsx";


export type HeaderProps = Pick<TableColumnProps,
    "name" |
    "sortable" |
    "visible" |
    "sticky" |
    "text" |
    "altText" |
    "resizable" |
    "wrap" |
    "width" |
    "title"
> & {
    renderer?: (props: RendererProps) => ReactElement,
    className?: string,
};


/**
 * Creates column headers and configures cells in its column.  This is the primary interface for
 * configuring cells.
 *
 * @param props {HeaderProps}
 * @constructor
 */
export default function Header(props: HeaderProps): ReactElement {
    const {
        text,
        name,
        sortable = true,
        resizable = true,
        wrap = false,
        title,
        sticky = false,
        className,
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const gridContext = use(GridContext);
    const {
        gridDispatch,
        sortColumns,
        pinned,
    } = gridContext;
    const focusModel = gridContext.focusModel?.current;
    const selectionModel = gridContext.selectionModel?.current;
    const active = sortColumns?.[0] === name;
    let sortDirection = gridContext.sortDirection;
    const widthValues = gridContext.columnWidths?.values();
    const isInitialized = useRef(false);

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

    // eslint-disable-next-line react-hooks/refs
    if (!isInitialized.current) {
        if (sticky) pinned.add(name);
        isInitialized.current = true;
    }

    // ========================================== Effects
    /*
    Resets column widths and offsets in response changes that cause re-renders.
     */
    useEffect(() => {
        const offset = findOffset();
        if (offset != null) {
            gridContext.offsets.set(name, offset);
        }
        const width = gridContext.columnWidths?.get(name);
        if (ref.current != null) {
            if (width != null) ref.current.style.width = `${width}px`;
        }
    }, [
        gridContext.pinned,
        gridContext.sortColumns,
        gridContext.sortDirection,
        gridContext.columnWidths,
        widthValues,
        gridContext.offsets,
        name,
    ]);


    // =========================================== Event handlers
    const updatePin = () => {
        const pushed = !pinned.has(name)
        const el = ref.current;
        if (el != null && pushed) {
            gridDispatch?.({type: "pin", payload: {name}});
        } else if (el != null && !pushed) {
            gridDispatch?.({type: "unpin", payload: {name}});
        }
    };


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
        .findIndex(col => col.name === name);

    const handleResize = (delta: number) => {
        if (ref.current != null) {
            const width = ref.current.offsetWidth;
            let newWidth = width + delta;
            newWidth = newWidth < MIN_COLUMN_WIDTH ? MIN_COLUMN_WIDTH : newWidth;
            ref.current.style.width = `${newWidth}px`;
            gridContext.columnWidths?.set(name, newWidth);
            gridDispatch?.({type: "update"});
        }
    }

    const clear = () => {
        focusModel?.clear();
        selectionModel?.clearSelections();
    };

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
                gridContext.pinned.has(name) ? styles.stickyColumn : "",
                gridContext.pinned.size - 1 === colIndex ? styles.divider : "",
                className,
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
                <ColumnResizer onResize={handleResize} />
            ) : ""}
        </div>
    );
}



/* ============================================ Private */
function onDragOver(e: DragEvent): void {
    e.preventDefault();
}

