import {Emitter} from "./Observable.ts";
import type {BiFunction, Predicate} from "../types/types.ts";
import {numericId} from "../util/utils.ts";

type Identifiable = {
    id: number | string | undefined
}

type ItemState = Identifiable & {
    deleted: boolean,
}

/**
 * The base class for data rows in the table model.
 *
 * <p>This class exists to associated metadata with list items:
 * missing IDs, status (e.g., deleted), etc.  Otherwise, it would
 * not be necessary. </p>
 *
 * @param {T} data The object to wrap.
 * @typeParam T The type of data contained in the Record
 */
export class ListItem<T> {
    #data: T;
    /** Whether the record has been marked for deletion */
    #deleted: boolean = false;
    #id: number | string;


    static from<T, U extends ListItem<T>>(original: ListItem<T>, updates: T): U {
        const data = {...original.getAll(), ...updates};
        const Constructor = original.constructor  as new (data: T, state?: ItemState) => U;
        return new Constructor(data);
    }

    /**
     *
     * @param {T} data The data contained in the ListItem
     * @param {ItemState} [state] For cloning
     */
    constructor(data: T, state?: ItemState) {
        this.#data = data;
        this.#id = (data as Identifiable).id ?? state?.id ?? numericId();
    }

    getAll(): T {
        return this.#data;
    }

    get(key: keyof T): unknown {
        return this.#data[key];
    }


    get id(): number | string {
        return this.#id;
    }


    /**
     * @returns {boolean} Whether the record has been marked for deletion.
     */
    get deleted(): boolean {
        return this.#deleted;
    }

    /**
     * If the value is true, it Marks the record for deletion.
     * @param {boolean} value  Whether to mark the record for the deletion
     */
    set deleted(value: boolean) {
        this.#deleted = value;
    }

    get state(): ItemState {
        return {id: this.id, deleted: this.deleted};
    }


    toString(): string {
        return JSON.stringify(this.#data)
    }


    /**
     * Makes a deep copy of this instance.
     */
    clone(): this {
        let clonedData: T;

        if (this.#isClonable(this.#data)) {
            clonedData = this.#data.clone();
        } else if (Object.isFrozen(this.#data) || Object.isSealed(this.#data)) {
            // If the object is frozen, a swallow or deep object spread creates a safe, mutable copy
            clonedData = { ...this.#data};
        } else if (Object.getPrototypeOf(this.#data) === Object.prototype) {
            // If the data is a struct, perform a deep copy
            clonedData = structuredClone(this.#data);
        } else {
            // Custom class fallback
            const instance = this.#data as {constructor: new (args: Partial<T>) => T};
            const Constructor = instance.constructor;
            clonedData = new Constructor({...this.#data});
        }

        return this.create(clonedData, this.state);
    }

    /**
     * Merges new data with this instance's data and returns a new instance.
     * @param data
     * @returns ListItem A new instance with the merged data.
     */
    merge(data: T): this {
        return this.create({...this.getAll(), ...data});
    }


    /**
     * A convenience method for creating new instances in a way that works with subclasses.
     * @param data
     * @param {ItemState} [state]
     * @protected
     */
    protected create(data: T, state?: ItemState): this {
        const Constructor = this.constructor  as new (data: T, state?: ItemState) => this;
        return new Constructor(data, state);
    }

    /**
     * Structural type guard for custom cloning
     */
    #isClonable(value: unknown): value is { clone(): T } {
        return (
            typeof value === 'object' &&
            value !== null &&
            'clone' in value &&
            typeof (value as Record<string, unknown>).clone === 'function'
        );
    }
}


export type ListChangeType = "added" | "modified" | "deleted";
export type ListChange<T> = {
    index: number,
    type: ListChangeType,
    record?: ListItem<T>,
}
export type ListItemUpdate<T> = {
    index: number,
    record: ListItem<T>,
}
export type PartialUpdate<T> = {
    index: number,
    value: Partial<T>,
    record?: ListItem<T>,
    previous?: ListItem<T>,
}


/**
 * An array-like list that notifies listeners when its underlying data has changed.
 *
 * @typeParam T The type of data contained in each Record in the list
 */
export default class ObservableList<T> extends Emitter<ListChange<T>[]> {
    #data: ListItem<T>[];

    constructor(data: T[]) {
        super();
        this.#data = data.map(item => new ListItem(item));
    }

    get length(): number {
        return this.#data
            .filter(record => !record.deleted)
            .length;
    }

    get(index: number): ListItem<T> | undefined {
        return this.#data[index];
    }

    add(record: T): void {
        this.#data[this.#data.length] = new ListItem(record);
    }

    slice(startIndex: number, endIndex?: number): ListItem<T>[] {
        return this.#data.slice(startIndex, endIndex);
    }

    getAll(): ListItem<T>[] {
        return this.filter(record => !record.deleted);
    }

    /**
     * Replaces/inserts the specified Record at the specified index.  IF an item exists
     * at the specified index, it is replaced.  To insert an item in the list without
     * replacing the existing item (shifting subsequent items down), use insertBefore().
     *
     * @param index The index at which to insert the Record.
     * @param data The data to insert
     */
    insertAt(index: number, data: T): boolean {
        const record = new ListItem<T>(data);
        this.#data[index] = record;
        this.emit("dataChanged", [{type: "modified", index, record}]);
        return true;
    }


    /**
     * Update multiple records at once.
     *
     * @param updates An array of ListItemUpdates
     */
    batchUpdate(updates: ListItemUpdate<T>[]): void {
        const results = updates
            .map(({index, record}) => {
                this.#data[index] = record
                const type:ListChangeType = "modified";
                return {
                    type,
                    record,
                    index,
                };
            });
        if (results.length > 0) {
            this.emit("dataChanged", results);
        }
    }

    deleteAt(index: number): boolean {
        const record = this.#data[index];
        if (record != undefined) {
            record.deleted = true;
            this.emit("dataChanged", [{type: "deleted", index}]);
            return true;
        }
        return false;
    }

    insertBefore(index: number, data: T): void {
        this.#data = [
            ...this.#data.slice(0, index),
            new ListItem(data),
            ...this.#data.slice(index)
        ];
    }

    sort(comparator: BiFunction<ListItem<T>, ListItem<T>, number>): void {
        this.#data.sort(comparator);
    }

    find(criteria: Predicate<ListItem<T>>): ListItem<T> | undefined {
        return this.#data.find(criteria);
    }

    findIndex(criteria: Predicate<ListItem<T>>): number | undefined {
        return this.#data.findIndex(criteria);
    }

    filter(criteria: Predicate<ListItem<T>>): ListItem<T>[] {
        return this.#data.filter(criteria);
    }
}




