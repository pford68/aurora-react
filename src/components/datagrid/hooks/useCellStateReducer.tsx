import {type Dispatch, useReducer} from "react";
import type {DTO} from "../../../model/dtos.ts";


export type CellActivationState = {
    active: boolean,
    valid: boolean,
    task?: string,
};

export type CellActivationAction = {
    type: "activate"
        | "deactivate"
        | "discard"
        | "invalidate"
        | "validated"
        | "clear"
        | "undo"
        | "redo"
    payload?: DTO<unknown>,
}



export default function useCellStateReducer(): [CellActivationState, Dispatch<CellActivationAction>] {

    const reducer = (state: CellActivationState, action: CellActivationAction) => {
        switch (action.type) {
            case "activate":
            case "clear":
                return {...state, active: true, task: action.type};
            case "deactivate":
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

    const initState: CellActivationState = {active: false, valid: true};
    return useReducer(reducer, initState);
}
