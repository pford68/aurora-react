import type {Command} from "../types/types.ts";

export class StackManager {
    undoStack: Command[] = [];
    redoStack: Command[] = [];


    execute(command: Command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo history on brand new user interaction mutations
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const command = this.undoStack.pop();
        if (command != null) {  // TypeScript considers this necessary despite the first line.
            command.undo();
            this.redoStack.push(command);
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const command = this.redoStack.pop();
        if (command != null) {  // TypeScript considers this necessary despite the first line.
            command.execute();
            this.undoStack.push(command);
        }
    }
}