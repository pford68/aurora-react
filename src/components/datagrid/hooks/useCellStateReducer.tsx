import {type Dispatch, type RefObject, useContext, useReducer} from "react";
import SaveCommand from "../../../commands/SaveCommand.ts";
import {GridContext} from "../GridContext.ts";
import type {DTO} from "../../../model/dtos.ts";


export type CellFactoryState = {
    active: boolean,
    valid: boolean,
    task?: string,
};

export type CellFactoryAction = {
    type: "activate"
        | "deactivate"
        | "discard"
        | "invalidate"
        | "validated"
        | "clear"
        | "undo"
        | "redo"
    payload?: DTO<any>,
}


type useReducerProps = {
    /** The reducer uses the value from this element. */
    ref: RefObject<HTMLInputElement | null>,
    /** The rowIndex of the cell. */
    rowIndex: number,
    /** The name of the cell data from the data row. */
    name: string,
}

function checkable(renderType: string) {
    return renderType === "checkbox" || renderType === "switch";
}

function findValue(node: HTMLInputElement | null, dto?:DTO) {
    let value = node ?node.value : null;
    if (node && dto != null && checkable(dto?.renderType)) {
        value = String(node.checked);
    }
    return value;
}


export default function useCellStateReducer(props: useReducerProps): [CellFactoryState, Dispatch<CellFactoryAction>] {

    const {ref, rowIndex} = props;
    const gridContext = useContext(GridContext);
    const {
        items,
        undoStack,
        redoStack,
        nullable,
    } = gridContext;

    const reducer = (state: CellFactoryState, action: CellFactoryAction) => {
        switch (action.type) {
            case "activate":
            case "clear":
                return {...state, active: true, task: action.type};
            case "deactivate": { // Sends to focused mode and flushes changes.
                const {name} = ref.current ?? {};
                const dto = action.payload;
                let value = findValue(ref.current, dto);
                if (items != null && (value != null || nullable)) {
                    const updatedValue = String(value).trim().length > 0 ? value : null;
                    const newDto = dto?.clone(updatedValue);
                    const cmd = new SaveCommand(items);
                    cmd.setParameter({index: rowIndex, value: {[String(name)]: newDto?.valueOf()}})
                    cmd.execute();
                    redoStack?.clear();
                    undoStack?.push(cmd);
                }
                return {...state, active: false};
            }
            case "discard": { // Moves to focus mode and discards changes.
                return {...state, active: false};
            }
            case "invalidate": {
                return {...state, valid: false};
            }
            case "validated": {
                return {...state, valid: true};
            }
            default:
                throw(new Error());
        }
    }

    const initState: CellFactoryState = {active: false, valid: true};
    return useReducer(reducer, initState);
}
