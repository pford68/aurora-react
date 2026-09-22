import type {Command} from "../types/types.ts";
import {Emitter} from "../model/Observable.ts";

class StackManager extends Emitter<boolean> {

    #undoStack: Command[] = [];
    #redoStack: Command[] = [];
    #replaying = false;

    constructor() {
        super();
    }

    execute(command: Command): void {
        this.#replaying = true;
        let result = false;
        try {
            result = command.execute();
            this.#undoStack.push(command);
            this.#redoStack = []; // Reset forward history on new actions

        } finally {
            this.#replaying = false;
            this.emit("executed", result);
        }
    }

    undo(): void {
        const command = this.#undoStack.pop();
        if (command == null) return;
        this.#replaying = true;
        let result = false;

        try {
            result = command.undo();
            this.#redoStack.push(command);
        } finally {
            this.#replaying = false;
            this.emit("undo", result);
        }
    }

    redo(): void {
        const command = this.#redoStack.pop();
        if (command == null) return;
        this.#replaying = true;
        let result = false;

        try {
            result = command.redo();
            this.#undoStack.push(command);
        } finally {
            this.#replaying = false;
            this.emit("redo", result);
        }
    }

    clear(): void {
        this.#undoStack = [];
        this.#redoStack = [];
        this.#replaying = false;
    }

    get replaying(): boolean {
        return this.#replaying;
    }
}

const stackManager = new StackManager();
export default stackManager;