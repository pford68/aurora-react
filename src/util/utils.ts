import type {Coordinates, Struct} from "..//types/types";

export function joinCss(...varargs: Array<string | undefined>): string {
    return varargs.filter((arg) => arg !== undefined).join(" ");
}

export function assert(condition: boolean, msg: string): void {
    if (!condition) throw new Error(msg);
}

export function warn(condition: boolean, msg: string): void {
    if (!condition) console.warn(msg);
}

export function drawBox(start: Coordinates, end: Coordinates): {[key: string]: number} {
    const {rowIndex: startRowIndex, colIndex: startColIndex} = start;
    const {rowIndex: endRowIndex, colIndex: endColIndex} = end;
    const top = startRowIndex <= endRowIndex ? startRowIndex : endRowIndex;
    const bottom = startRowIndex === top ? endRowIndex : startRowIndex;
    const left = startColIndex <= endColIndex ? startColIndex : endColIndex;
    const right = startColIndex === left ? endColIndex : startColIndex;
    return {top, right, bottom, left};
}

export function isSubSet(o1: Struct, o2: Struct): boolean {
   return Object.keys(o1).find(key => o1[key] != o2[key]) == null;
}

export function compose<T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) {
    fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1);
}

export function isTextSelected(): boolean {
    const selection = getSelection();
    return selection != null && selection.type?.toLowerCase() === "range";
}

export function toISODateString(timestamp: number): string {
    return new Date(timestamp).toISOString().split("T")[0];
}

export function isDateString(value:string): boolean {
    if (!value || typeof value !== "string" || value.trim().length === 0) return false;

    const timestamp = Date.parse(value);
    return !isNaN(timestamp);
}

export function isValidTimestamp(value: number) {
    return !Number.isNaN(new Date(value).getTime());
}

/**
 * Like structuredClone, but can handle values that are custom class instances.
 * @param data
 */
export function structuredCloneWithInstances(data: Record<string, unknown>): Record<string, unknown> {
    const clonedData = structuredClone(data);
    const updates:Record<string, unknown> = {};

    interface Cloneable<T = unknown> {
        valueOf(): T;
        clone(value: T): this;
    }

    for (const key in clonedData) {
        if (Object.prototype.hasOwnProperty.call(clonedData, key)) {
            const item = clonedData[key];

            /*
            Replace cloned properties that ended up as empty objects.
            Such properties had custom instance for values in the original object.
             */
            if (item !== null && typeof item === 'object' && Object.keys(item).length === 0) {
                const originalItem = data[key] as Cloneable;

                if (
                    originalItem &&
                    typeof originalItem.clone === 'function' &&
                    typeof originalItem.valueOf === 'function'
                ) {
                    updates[key] = originalItem.clone(originalItem.valueOf());
                }
            }
        }
    }

    return {...clonedData, ...updates};
}

