import {Emitter} from "./Observable.ts";
import type {BiFunction, Predicate} from "../types/types.ts";
import {v4 as uuid} from "uuid";

type Identifiable = {
    id: string
}

type Metadata = Identifiable & {
    deleted: boolean,
}

export interface Cloneable {
    clone(): Cloneable;
}

export type Entry<T> = Cloneable & Metadata & {
    get: (key: keyof T) => unknown,
    getAll: () => T,
    merge: (data: Partial<T>) => Entry<T>,
}

/**
 * Allows associating metadata with data, without enriching/altering the data.
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
    readonly #id: string;

    /**
     * Creates a new copy of the specified item, only with modifications to the copy.
     * @param original
     * @param updates
     */
    static from<T, U extends ListItem<T>>(original: ListItem<T>, updates?: T): U {
        const data = {...original.getAll(), ...(updates ?? {})};
        const Constructor = original.constructor  as new (data: T, state?: Metadata) => U;
        return new Constructor(data);
    }

    /**
     *
     * @param {T | Entry<T>} data The data contained in the ListItem
     */
    constructor(data: T | Entry<T>) {
        this.#data = data instanceof ListItem ? data.getAll() : data;
        this.#deleted = (data as Metadata).deleted === true;
        this.#id = (data as Identifiable).id ?? uuid();
    }

    getAll(): T {
        return this.#data;
    }

    get(key: keyof T): unknown {
        return this.#data[key];
    }


    get id(): string {
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

    get metadata(): Metadata {
        return {id: this.id, deleted: this.deleted};
    }

    toString(): string {
        return JSON.stringify(this.#data);
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
            clonedData = { ...this.#data, ...this.metadata};
        } else if (Object.getPrototypeOf(this.#data) === Object.prototype) {
            // If the data is a struct, perform a deep copy
            clonedData = structuredClone({...this.#data, ...this.metadata});
        } else {
            // Custom class fallback
            const instance = this.#data as {constructor: new (args: Partial<T>) => T};
            const Constructor = instance.constructor;
            clonedData = new Constructor({...this.#data, ...this.metadata});
        }

        return this.create(clonedData);
    }

    /**
     * Merges new data with this instance's data and returns a new instance.
     * @param data
     * @returns ListItem A new instance with the merged data.
     */
    merge(data: Partial<T>): this {
        return this.create({...this.getAll(), ...data, ...this.metadata});
    }


    /**
     * A convenience method for creating new instances in a way that works with subclasses.
     * @param data
     * @protected
     */
    protected create(data: T): this {
        const Constructor = this.constructor  as new (data: T) => this;
        return new Constructor(data);
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


export type ListChangeType = "added" | "modified" | "deleted" | "inserted";
export type ListChange<T> = {
    index: number,
    type: ListChangeType,
    record?: Entry<T>,
}
export type ListItemUpdate<T> = {
    index: number,
    target: string | number | Entry<T>,
    value: T | Entry<T>,
}
export type PartialUpdate<T> = {
    index: number,
    value: Partial<T>,
    record?: Entry<T>,
    previous?: Entry<T>,
}


/**
 * An array-like list that notifies listeners when its underlying data has changed.
 *
 * @typeParam T The type of data contained in each Record in the list
 */
export default class ObservableList<T> extends Emitter<ListChange<T>[]> {
    /** Maintains the internal data. */
    #registry = new Map<string, Entry<T>>();
    /** For sorting */
    #order: string[] = [];
    #transformer: (data: T ) => Entry<T>;

    /**
     * @typeParam T The data type of the data contained in the list.
     * @param data {T[]} The raw initial data array
     * @param [transformer] Mapper to modify/clean incoming data structures as they are added to the list.
     */
    constructor(data: T[] = [], transformer?: (data: T) => Entry<T>) {
        super();
        this.#transformer = transformer ?? ((item: T) => {
            return new ListItem(item) as Entry<T>;
        });
        for (const rawItem of data) {
            this.add(rawItem);
        }
    }

    get length(): number {
        return this.#order.length;
    }


    /**
     * Gets an item by its order index, ID string, or instance footprint
     */
    get(target: number | string | Identifiable): Entry<T> | undefined {
        if (typeof target === 'number') {
            const id = this.#order[target];
            return id ? this.#registry.get(id) : undefined;
        }
        return this.#registry.get(this.#resolveId(target));
    }


    getAll(): Entry<T>[] {
        const result: Entry<T>[] = [];
        for (const id of this.#order) {
            const record = this.#registry.get(id)!;
            if (!record.deleted) result.push(record);
        }
        return result;
    }


    add(rawData: T): void {
        // Legit use of automatic transformer!
        const item = this.#transformer(rawData);

        this.#registry.set(item.id, item);
        this.#order.push(item.id);

        this.emit("dataChanged", [{
            type: "added",
            index: this.#order.length - 1,
            record: item
        }]);
    }


    /**
     * The primary method for updating/replacing items in a list.
     *
     * <p>Operates on only one item at a time.  To update multiple
     * records at once, use batchUpdate().</p>
     *
     * @typeParam T  The data type of the items in the list.
     * @param {string | Entry<T>} target The record to update
     * @param {T | Entry<T>} payload The updates to the record
     */
    update(target: string | Entry<T>, payload: T | Entry<T>): boolean {
        const id = this.#resolveId(target);
        if (!this.#registry.has(id)) return false;

        const record = this.#isEntry(payload) ? payload : this.#transformer(payload);
        this.#registry.set(id, record);

        const index = this.#order.indexOf(id);
        this.emit("dataChanged", [{ type: "modified", index, record }]);
        return true;
    }


    slice(startIndex: number, endIndex?: number): Entry<T>[] {
        return this.#order
            .slice(startIndex, endIndex)
            .map(id => this.#registry.get(id)!);
    }



    /**
     * Updates multiple records at once.
     *
     * @typeParam T the data type of the items in the list.
     * @param {ListItemUpdate[]} updates An array of ListItemUpdates
     */
    batchUpdate(updates: ListItemUpdate<T>[]): void {
        if (!updates || updates.length === 0) return;

        const results: ListChange<T>[] = [];

        for (const { target, value } of updates) {
            let id: string | undefined;
            let index = -1;

            // 1. Resolve the ID and Index polymorphically
            if (typeof target === 'number') {
                index = target;
                id = this.#order[index];
            } else {
                id = typeof target === 'string' ? target : target.id;
                index = this.#order.indexOf(id);
            }

            // Guard: If the item doesn't exist in the list, skip it
            if (!id || index === -1 || !this.#registry.has(id)) {
                continue;
            }

            // 2. Pass raw data through the transformer if it's not already a ListItem
            const record = this.#isEntry(value) ? value : this.#transformer(value);

            // 3. Update internal registry (The order array doesn't change for a modification)
            this.#registry.set(id, record);

            // 4. Queue up the change event data
            results.push({
                type: "modified",
                index,
                record
            });
        }

        // 5. Performance Win: Emit exactly ONE event for the entire batch
        if (results.length > 0) {
            this.emit("dataChanged", results);
        }
    }


    insertBefore(pivotTarget: string | Entry<T>, rawData: T): boolean {
        const pivotId = this.#resolveId(pivotTarget);
        const targetIndex = this.#order.indexOf(pivotId);
        if (targetIndex === -1) return false;

        const record = this.#transformer(rawData);
        this.#registry.set(record.id, record);
        this.#order.splice(targetIndex, 0, record.id);

        this.emit("dataChanged", [{ type: "inserted", index: targetIndex, record }]);
        return true;
    }

    /**
     * Polymorphic soft delete
     */
    delete(target: string | Entry<T>): boolean {
        const id = this.#resolveId(target);
        const record = this.#registry.get(id);

        if (record && !record.deleted) {
            record.deleted = true;
            const index = this.#order.indexOf(id);
            this.emit("dataChanged", [{ type: "deleted", index }]);
            return true;
        }
        return false;
    }

    sort(comparator: BiFunction<Entry<T>, Entry<T>, number>): void {
        this.#order.sort((a, b) => {
            return comparator(this.#registry.get(a)!, this.#registry.get(b)!);
        });
    }


    /**
     * Returns the first record that matches the criteria,or undefined if no match is found.
     *
     * @param {Function} criteria A find function taking an Entry as input
     * @returns {Entry | undefined} The first matching record or undefined
     */
    find(criteria: (item: Entry<T>) => boolean): Entry<T> | undefined {
        for (const id of this.#order) {
            const record = this.#registry.get(id)!;
            if (criteria(record)) return record;
        }
        return undefined;
    }

    /**
     * Returns the index of first record that matches the criteria,or -1
     * if no match is found.
     *
     * @param {Function} criteria A find function taking an Entry as input
     * @returns {number} The index of the first matching record or -1
     */
    findIndex(criteria: (item: Entry<T>) => boolean): number {
        for (let i = 0; i < this.#order.length; i++) {
            const record = this.#registry.get(this.#order[i])!;
            if (criteria(record)) return i;
        }
        return -1; // Correct native fallback instead of undefined
    }


    filter(criteria: Predicate<Entry<T>>): Entry<T>[] {
        const result: Entry<T>[] = [];

        for (const id of this.#order) {
            const record = this.#registry.get(id)!;
            // Apply the criteria function to the ListItem wrapper
            if (criteria(record)) {
                result.push(record);
            }
        }

        return result;
    }

    /**
     * Helper to normalize any incoming item or string into a strict ID
     */
    #resolveId(target: string | Identifiable): string {
        return typeof target === 'string' ? target : target.id;
    }

    #isEntry(that: T | Entry<T>): that is Entry<T> {
        return that instanceof ListItem;
    }

}

