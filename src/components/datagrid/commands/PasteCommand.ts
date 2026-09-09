import type {Command, Struct} from "../../../types/types.ts";
import CopyCommand, {type Clipboard} from "./CopyCommand.ts";
import ObservableList, {Record} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";

type PasteConfig<T extends Struct> = {
    items: ObservableList<T>
    rowIndex: number,
    colIndex: number,
    /** columnNames should be the current total column order at the time of the paste.*/
    columns: string[],
    clipboard?: Clipboard,
}

export default class PasteCommand<T extends Struct> implements Command {
    static readonly icon: IconProp = "paste";
    static readonly name: string = "Paste";
    static readonly accelerator: string = "⌘+v";
    readonly #previous: {id: string, clone: Record<T>}[];
    readonly #clipboard: Clipboard = sessionStorage;
    #rowIndex: number;
    #colIndex: number;
    #columns: string[];
    #items: ObservableList<T>;

    constructor(config: PasteConfig<T>) {
        const {items, clipboard, rowIndex, colIndex, columns} = config
        this.#items = items;
        this.#clipboard = clipboard ?? this.#clipboard;
        this.#rowIndex = rowIndex;
        this.#colIndex = colIndex;
        this.#columns = columns;
        this.#previous = [];
    }

    redo(): boolean {
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            const record = this.#items.find(record => record.id === prevRecord.id);
            record?.copy(prevRecord.clone);
        });

        return true;
    }

    execute(): boolean {
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        const clipboardItems = sessionStorage.getItem(CopyCommand.TOKEN);
        if (clipboardItems == null) return false;

        const startRowIndex = this.#rowIndex;
        const startColumnIndex = this.#colIndex;
        const updates = JSON.parse(clipboardItems);
        const update = updates.items.pop();
        if (update == null) return false;

        const {data} = update;
        data.forEach((item: T, index: number) => {
            const recordIndex = startRowIndex + index;
            const record = this.#items.get(recordIndex);
            if (doClone && record != null) this.#previous.push({id: record.id, clone: record.clone()});

            let currentColIndex = startColumnIndex;
            update.columnNames.forEach((copiedCol: string) => {
                const destName = this.#columns[currentColIndex];
                if (destName != null) {
                    record?.set(destName, item[copiedCol]);
                }
                currentColIndex++;
            });
        });
        return true;
    }
}