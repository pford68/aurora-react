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
        | "redo",
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

export default function useCellStateReducer(props: useReducerProps): [CellFactoryState, Dispatch<CellFactoryAction>] {

    const {ref, rowIndex} = props;
    const gridContext = useContext(GridContext);
    const {
        items,
        undoStack,
        redoStack,
    } = gridContext;

    const reducer = (state: CellFactoryState, action: CellFactoryAction) => {
        switch (action.type) {
            case "activate":
            case "clear":
                return {...state, active: true, task: action.type};
            case "deactivate": { // Sends to focused mode and flushes changes.
                const {name} = ref.current ?? {};
                const dto = action.payload;
                const value = ref.current ? ref.current.value : null;
                dto?.clone(value);
                if (dto != null && items != null && value != null && !(String(value).trim().length === 0 && !gridContext.nullable)) {
                    const cmd = new SaveCommand(items);
                    cmd.setParameter({index: rowIndex, value: {[String(name)]: dto.valueOf()}})
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
