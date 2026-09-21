import type {Command, Struct} from "../../../types/types.ts";
import CopyCommand, {type Clipboard, type CopyPayload} from "./CopyCommand.ts";
import ObservableList, {type Entry} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";
import undoable from "../../../decorators/undoable.ts";

type PasteConfig<T extends Struct> = {
    items: ObservableList<T>
    rowIndex: number,
    colIndex: number,
    /** columnNames should be the current total column order at the time of the paste.*/
    columns: string[],
    clipboard?: Clipboard,
    deserializer?: (value: string) => CopyPayload,
}

function defaultDeserializer(value: string): CopyPayload{
    return JSON.parse(value);
}

export default class PasteCommand<T extends Struct> implements Command {
    static readonly icon: IconProp = "paste";
    static readonly name: string = "Paste";
    static readonly accelerator: string = "⌘+v";
    readonly #previous: Entry<T>[];
    readonly #clipboard: Clipboard = sessionStorage;
    #rowIndex: number;
    #colIndex: number;
    #columns: string[];
    #items: ObservableList<T>;
    #deserializer: (value: string) => CopyPayload;

    constructor(config: PasteConfig<T>) {
        const {items, clipboard, rowIndex, colIndex, columns, deserializer} = config
        this.#items = items;
        this.#clipboard = clipboard ?? this.#clipboard;
        this.#rowIndex = rowIndex;
        this.#colIndex = colIndex;
        this.#columns = columns;
        this.#previous = [];
        this.#deserializer = deserializer ?? defaultDeserializer;
    }

    redo(): boolean {
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach(prevRecord => {
            this.#items.update(prevRecord, prevRecord.clone());
        });

        return true;
    }

    @undoable
    execute(): boolean {
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        const clipboardItems = sessionStorage.getItem(CopyCommand.TOKEN);
        if (clipboardItems == null) return false;

        const startRowIndex = this.#rowIndex;
        const startColumnIndex = this.#colIndex;
        const parsedItems =  this.#deserializer(clipboardItems);
        const transformer = this.#items.transformer;
        const {data, columnNames} = parsedItems.payload;

        (data as T[]).forEach((item: T, index: number) => {
            const recordIndex = startRowIndex + index;
            const record = this.#items.get(recordIndex);
            if (record != null) {
                if (doClone) this.#previous.push(record.clone() as Entry<T>);

                let currentColIndex = startColumnIndex;
                const updates: Record<string, unknown> = {};
                columnNames?.forEach((copiedCol: string) => {
                    const destName = this.#columns[currentColIndex];
                    const newValue = item[copiedCol];
                    if (destName != null) {
                        // Transform each value to the expected type for the column.
                        // We are passing a partial T to the transformer, so we cast it to T.
                        updates[destName] = transformer({[copiedCol]: newValue} as T).get(copiedCol);
                    }
                    currentColIndex++;
                });
                this.#items.update(record, record.merge(updates as Partial<T>));
            }
        });
        return true;
    }
}