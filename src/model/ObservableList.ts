import {Emitter} from "./Observable.ts";
import type {BiFunction, Predicate} from "../types/types.ts";
import {numericId} from "../util/utils.ts";

type Identifiable = {
    id: number | string | undefined
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

    /**
     *
     * @param {T} data The data contained in the ListItem
     * @param {number | string} [id] For cloning
     */
    constructor(data: T, id: number | string | undefined = undefined) {
        this.#data = data;
        this.#id = (data as Identifiable).id ?? id ?? numericId();
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
     * Sets a new value at the specified key, which does not need to exist beforehand.
     * @param key
     * @param value
     */
    set(key: string, value: unknown): void {
        this.#data = {...this.#data,  [key]: value};
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

    update(partial: T): void {
        this.#data= {...this.#data, ...partial};
    }

    toString(): string {
        return JSON.stringify(this.#data)
    }


    /**
     *
     */
    clone(): this {
        return this.create(structuredClone(this.getAll()), this.id);
    }

    /**
     * Copies data from another ListItem to this and overrides the values in this.
     * @param that
     */
    copy(that: this): void {
        this.update(that.getAll());
    }

    /**
     * A convenience method for creating new instances in a way that works with subclasses.
     * @param data
     * @param {string | number} [id]
     * @protected
     */
    protected create(data: T, id: string | number | undefined): this {
        const Constructor = this.constructor  as new (data: T, id: string | number | undefined) => this;
        return new Constructor(data, id);
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
     * Inserts/replaces the specified Record at the specified index.  The Record can be
     * an updated version of the original.  Use this when you have an Record and want to
     * re-insert it to notify listeners that the list has been updated.
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

    insertBefore(index: number, record: ListItem<T>): void {
        this.#data = [
            ...this.#data.slice(0, index),
            record,
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




