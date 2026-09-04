import {
    type ReactElement,
    type MouseEvent,
    type KeyboardEvent,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    type ComponentType,
} from "react";
import type {Coordinates} from "../../types/types.ts";
import {GridContext} from "./GridContext.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./DataGrid.module.css";
import type {Configuration, RendererProps} from "./Datagrid.types.ts";
import {EditMode, FocusMode} from "./cellStates.ts";
import useCellStateReducer from "./hooks/useCellStateReducer.tsx";
import usePreviousState from "./hooks/usePreviousState.tsx";
import {PageContext} from "./PageContext.ts";
import ContextMenu from "../overlays/ContextMenu.tsx";
import type {ListItem} from "../../model/ObservableList.ts";
import {AbstractDTO, type DTO, type DTOprops} from "../../model/dtos.ts";
import {getDecoratorByType, type Newable} from "../../model/typeInference.ts";

function getDecoratorInstance<T, V extends AbstractDTO<T>>(value: T, type?: string, newable?: Newable<T, V>, props?: DTOprops): DTO<T> {
    const decorator = newable ?? getDecoratorByType(value, type);
    return new decorator(value, props);
}

/**
 * @typeParamy V the type of data contained in a DTO
 */
export type GridCellProps<V> = Configuration<{
    renderer: ComponentType<RendererProps>,
    row: ListItem,
    rowIndex: number,
    colIndex: number,
    decorator?: DTO<V> | Newable<any, any>,
}>

/**
 * Responsible for rendering  cells and their content.
 *
 * @param props
 * @constructor
 */
export default function GridCell<V extends string | number | boolean>(props: GridCellProps<V>): ReactElement {
    // ================================= Declarations
    const {
        name,
        row,
        rowIndex,
        colIndex,
        className,
        renderer:Renderer,
        editable = true,
        readOnly = false,
        type = "string",
        locale,
        format,
        formType,
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
    const [state, dispatch] = useCellStateReducer({
        ref: rendererRef,
        rowIndex,
        name,
    });
    const previousActiveState = usePreviousState({watch: state.active});
    const [selected, setSelected] = useState(() => {
        return  selectionModel?.isContained(rowIndex, colIndex) ?? false;
    });
    const value = (row.get(name) as V);
    const dto = typeof decoratorProp === "object"
        ? decoratorProp
        : getDecoratorInstance(value, type, decoratorProp, {locale, formType, format});

    if (dto === undefined) {
        throw new Error(`DTO not found: props = ${name}, ${value}`);
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
        // If the state is active, we just want to be able to click and type normally.
        if (state.active) return;

        // Handle double-clicks vs.single-clicks
        switch (detail) {
            case 2:
                dispatch?.({type: "activate"});
                break;
            default:
                e.preventDefault();
                if (e.shiftKey) {
                    selectionModel?.select(rowIndex, colIndex);
               } else /* if (!state.active)*/ {
                    focusModel?.focus(rowIndex, colIndex);
                    selectionModel?.reset(rowIndex, colIndex);
                }
                // This is the single-click/active use case.  The cell is active. I see no need to allow propagation.
                e.stopPropagation();
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
    const rendererProps = {
        name,
        editable,
        ref:rendererRef,
        readOnly,
        value: dto,
        type: dto.formType,
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
               <Renderer {...rendererProps} />
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


