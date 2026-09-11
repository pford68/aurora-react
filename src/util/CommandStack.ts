import  type {Command} from "../types/types";

export class CommandStack {
    #data: Command[];

    constructor() {
        this.#data = [];
    }

    get length(): number {
        return this.#data.length;
    }

    clear(): void {
        this.#data = [];
    }

    push(item: Command): void {
        this.#data.push(item);
    }

    pop(): Command | undefined {
        return this.#data.pop();
    }

    clone(): CommandStack {
        const clone = new CommandStack();
        this.#data.forEach(item => clone.push(item));
        return clone;
    }
}