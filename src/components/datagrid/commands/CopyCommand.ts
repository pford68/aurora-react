import type {BiFunction, Command, Struct} from "../../../types/types.ts";
import {v4 as uuid} from "uuid";
import {ListItem} from "../../../model/ObservableList.ts";
import {isTextSelected} from "../../../util/utils.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";

export type Clipboard = {
    setItem: BiFunction<string, string, void>
}

export type CopyConfig<T extends Struct> = {
    selectedItems: ListItem<T>[],
    columns: string[],
    clipboard?: Clipboard,
}

export type CopyPayload = {
    payload: { data: {[key: string]: unknown}[], columnNames?: string[] }
}


export default class CopyCommand<T extends Struct> implements Command {
    static readonly icon: IconProp = "copy";
    static readonly name: string = "Copy";
    static readonly accelerator: string = "⌘+c";
    #selectedItems: ListItem<T>[];
    #values: {[key:string]: unknown}[];
    #clipboard: Clipboard = sessionStorage;
    #columns: string[];
    static TOKEN: string = uuid();

    constructor(config: CopyConfig<T>) {
        const {selectedItems, clipboard, columns} = config;
        this.#clipboard = clipboard ?? this.#clipboard;
        this.#selectedItems = selectedItems;
        this.#columns = columns;
        this.#values = [];
        selectedItems.forEach(record => {
            const data: {[key:string]: unknown} = {};
            columns.forEach(name => {
                data[name] = isTextSelected() ? getSelection()?.toString() : record.get(name);
            });
            this.#values.push(data);
        });
    }

    execute(): boolean {
        const payload:CopyPayload = {payload: { data: this.#values, columnNames: this.#columns }};
        this.#clipboard.setItem(CopyCommand.TOKEN, JSON.stringify(payload));
        return true;
    }

    redo(): boolean {
        return false;
    }

    undo(): boolean {
        return false;
    }

    get values(): {[key:string]: unknown}[] {
        return this.#values;
    }

    get selectedItems(): ListItem<T>[] {
        return this.#selectedItems;
    }

    get columns(): string[] {
        return this.#columns;
    }
}