import CopyCommand, {type CopyConfig} from "./CopyCommand.ts";
import type {Struct} from "../../../types/types.ts";
import ObservableList, {type Entry} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";


export default class CutCommand<T extends Struct> extends CopyCommand<T> {

    static readonly icon: IconProp = "cut";
    static readonly name: string = "Cut";
    static readonly accelerator: string = "⌘+x";
    readonly #previous: Entry<T>[];
    #list: ObservableList<T>;

    constructor(config: CopyConfig<T>, list: ObservableList<T>) {
        super(config);
        this.#previous = [];
        this.#list = list;
    }

    redo(): boolean {
        super.execute();
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            this.#list.update(prevRecord, prevRecord.clone());
        });

        return true;
    }

    execute(): boolean {
        super.execute();
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        this.selectedItems.forEach(item => {
            if (doClone) this.#previous.push(item.clone());

            const nulls:Record<string, unknown | null> = {}
            this.columns.forEach(name => {
                nulls[name] = null;
            });
            this.#list.update(item, item.merge(nulls as Partial<T>));
        });

        return true;
    }

}