import {
    type ReactElement,
    type MouseEvent,
    type KeyboardEvent,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback, type ComponentPropsWithoutRef,
} from "react";
import type {Coordinates, Struct} from "../../../types/types";
import {GridContext} from "../GridContext";
import {joinCss} from "../../../util/utils";
import styles from "../DataGrid.module.css";
import type {DTO, RendererProps} from "../../renderers/types";
import {EditMode, FocusMode} from "./modes";
import useCellFactoryReducer from "./useCellFactoryReducer";
import usePreviousState from "./usePreviousState";
import {PageContext} from "../PageContext";
import ContextMenu from "../../overlays/ContextMenu.tsx";
import {getDecoratorByType, type Newable} from "../../renderers/typeInference.ts";
import type {AbstractDTO} from "../../renderers/decorators.ts";
import type {Record} from "../../../ObservableList.ts";


function getDecoratorInstance<T, V extends AbstractDTO<T>>(value: T, type: string, prop?: Newable<T, V>): DTO<T> {
    const decorator = prop ?? getDecoratorByType(value, type);
    return new decorator(value);
}

/**
 * CellFactoryProps does <strong>not</strong> extend BaseRendererProps. While
 * the GridCell uses information passed down from the TableColumn to configure
 * its renderer, the GridCell does not allow the props to trickle down. Its
 * props can be quite different from the props it ultimately sets on its renderer.
 *
 * @param T the type of data contained in a Record
 */
export type GridCellProps<T extends Struct, V> =
    ComponentPropsWithoutRef<"div"> &
    RendererProps<V, T> &{
    rowIndex: number,
    colIndex: number,
    row: Record<T>,
    renderer: (props: RendererProps<V, T>) => ReactElement,
    decorator: DTO<V>,
};


/**
 * Responsible for rendering  cells and their content.
 *
 * @param props
 * @constructor
 */
export default function GridCell<T extends Struct, V>(props: GridCellProps<T, V>): ReactElement {
    // ================================= Declarations
    const {
        name,
        row,
        rowIndex,
        colIndex,
        className,
        renderer,
        editable = true,
        readOnly = false,
        type = "string",
        format,
        onBlur,
        onFocus,
        onKeyDown: onKyDownProp,
        onClick: onClickProp,
        wrap = false,
        width,
        contextMenuItems,
        decorator: decoratorProp,
    } = props;
    const gridContext = useContext(GridContext);
    const {
        columnWidths,
        columnSizing,
        pinned,
    } = gridContext;
    const selectionModel = gridContext.selectionModel?.current;
    const focusModel = gridContext.focusModel?.current;
    const pageContext = useContext(PageContext);
    const ref = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<HTMLInputElement>(null);

    // ================================================= State
    const [state, dispatch] = useCellFactoryReducer({
        ref: rendererRef,
        rowIndex,
        name,
    });
    const previousActiveState = usePreviousState({watch: state.active});
    const [selected, setSelected] = useState(() => {
        return  selectionModel?.isContained(rowIndex, colIndex) ?? false;
    });
    const value = (row.get(name) as V);
    // I want to allow mere objects (instead of only constructors), but I have not tested this (2026/08/17)
    const dto = typeof decoratorProp === "object"
        ? decoratorProp
        : getDecoratorInstance(value, type, decoratorProp);

    if (dto === undefined) {
        throw new Error(`Decorator not found: props = ${name}, ${value}`);
    }

    const focusMode = new FocusMode(gridContext);
    const editMode = new EditMode(dto);

    //==================================================== Effects
    /*
    Handles auto-sizing by first-page column content.
     */
    useEffect(() => {
        if (width == null && ref.current != null) {
            const parent = ref.current.parentElement;
            const contextWidth = columnWidths.get(name);
            if (parent != null && pageContext.page === 0) {
                const width = parent.getBoundingClientRect().width;
                parent.style.width = `${Math.max(width, contextWidth ?? 0)}px`;
                if (contextWidth == null || width > contextWidth) {
                    columnWidths.set(name, width);
                }
            } else if (parent != null) {
                // Setting the cell width on subsequent pages.
                parent.style.width = `${columnWidths.get(name)}px`;
            }
        }
        return () => {
            const node = ref.current?.parentElement;
            if (node != null) {
                node.style.width = "unset";
            }
        }
    }, [
        columnSizing,
        pinned,
    ]);


    /*
    Setting the focusChanged and selectionChanged listeners. Currently, the focus/selection models are allowed
    to change during re-renderers, so we reset the listeners when changes are detected.
     */
    useEffect(() => {
        const onFocusChanged = (coords: Coordinates | undefined) => {
            if (coords?.colIndex === colIndex && coords?.rowIndex === rowIndex) {
                ref.current?.focus();
            } else if (previousActiveState.current === true) {
                // When we click on another cell, the currently active cell should deactivate.
                dispatch({type: "deactivate", payload: dto});
            }
        }
        const onSelectionChanged = () => {
            const result = selectionModel?.isContained(rowIndex, colIndex) ?? false;
            setSelected(result);
        }

        focusModel?.on("focusChanged", onFocusChanged);
        selectionModel?.on("selectionChanged", onSelectionChanged);

        return () => {
            focusModel?.off("focusChanged", onFocusChanged);
            selectionModel?.off("selectionChanged", onSelectionChanged);
        };
    }, []);


    /*
    Resets the focus on the current cell after transitions between active and inactive states.
     */
    useEffect(() => {
        if (state.active) {
            rendererRef.current?.focus();
            if (state.task === "clear") {
                rendererRef.current?.select();
            }
        } else if (focusModel?.isFocused(rowIndex, colIndex)){
            ref.current?.focus();
        }
    }, [state.active, value]);

  
    /*
    Sets the left position for pinning. Responds to changes in the set of pinned columns,
    but also responds to changes in the focused cell and in the active state in order to reset
    the left value.
     */
    useEffect(() => {
        const offset = gridContext.offsets.get(name);
        const el = ref.current?.parentElement;
        if (el != null && offset != null) el.style.left = `${offset}px`;
    }, [
        pinned,
        focusModel?.focused,
        state.active
    ])


    // ====================================== Event handlers
    const onClick = useCallback((e: MouseEvent) => {
        const {detail} = e;
        switch (detail) {
            case 2:
                if (state.active) return;
                dispatch?.({type: "activate"});
                break;
            default:
                e.preventDefault();
                if (e.shiftKey) {
                    selectionModel?.select(rowIndex, colIndex);
                } else if (!state.active) {
                    focusModel?.focus(rowIndex, colIndex);
                    selectionModel?.reset(rowIndex, colIndex);
                } else {
                    e.stopPropagation();
                }
        }
    }, [
        state,
        dispatch,
        selectionModel,
        focusModel
    ]);


    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            state.active
                ? editMode?.onKeyDown(e, dispatch)
                : focusMode?.onKeyDown(e, dispatch);
        },
        [
            state,
            editMode,
            focusMode,
            dispatch
        ],
    );

    const onFocusWithin = useCallback(
        () => focusModel?.sync(rowIndex, colIndex),
        [focusModel, rowIndex, colIndex],
    );



    // ============================================= Rendering
    const {top, right, bottom, left} = selectionModel?.edges ?? {};
    const finalClass = joinCss(
        styles.cell,
        props.readOnly ? styles.readonly : "",
        selected ? styles.selected : "",
        rowIndex === top ? styles.top : "",
        rowIndex === bottom ? styles.bottom : "",
        colIndex === left ? styles.left : "",
        colIndex === right ? styles.right : "",
        state.active ? styles.active : "",
        gridContext.pinned.has(name) ? styles.stickyColumn : "",
        gridContext.pinned.size - 1 === colIndex ? styles.divider : "",
        wrap === false ? styles.nowrap : "",
        type != null && styles[type] ? styles[type] : "",
        className,
    );
    const rendererClass = joinCss(
        state.active ? styles.active : styles.inactive,
    );


    // Weeding out unwanted props from higher up, sending only true renderer props.
    const rendererProps:RendererProps<V, T> = {
        name,
        editable,
        ref:rendererRef,
        readOnly,
        value: dto,
        rowIndex,
        colIndex,
        type: dto.renderType,
        format,
        onBlur,
        onFocus,
        onClick: onClickProp,
        onKeyDown: onKyDownProp,
        className: rendererClass,
        active: state.active,
        scale: typeof value === "number" ? props.scale : undefined,
    }

    return (
        <div
            tabIndex={0}
            className={finalClass}
            data-row-index={rowIndex}
            data-col-index={colIndex}
            data-col-name={name}
            data-editable={state.active}
        >
            <div
                ref={ref}
                tabIndex={-1}
                className={!state.valid ? styles.invalid : ""}
                onFocus={onFocusWithin}
                onClick={onClick}
                onDoubleClick={onClick}
                onKeyDown={onKeyDown}
            >
                {renderer(rendererProps)}
            </div>
            {contextMenuItems != null ? (
                <ContextMenu
                    commands={contextMenuItems}
                    targetRef={ref}
                />
            ) : ""}
        </div>
    )
}


