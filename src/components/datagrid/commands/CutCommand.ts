import CopyCommand, {type CopyConfig} from "./CopyCommand.ts";
import type {Struct} from "../../../types/types.ts";
import ObservableList, {ListItem} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";


export default class CutCommand<T extends Struct> extends CopyCommand<T> {

    static readonly icon: IconProp = "cut";
    static readonly name: string = "Cut";
    static readonly accelerator: string = "⌘+x";
    readonly #previous: ListItem<T>[];
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
            const currentIndex = this.#list.findIndex(item => item.id == prevRecord.id);
            if (currentIndex != null && currentIndex > -1) {
                this.#list.insertAt(currentIndex, prevRecord.clone());
            }
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
            const currentIndex = this.selectedItems.findIndex(record => record.id == item.id);
            this.#list.insertAt(currentIndex, item.merge(nulls as Partial<T>));
        });

        return true;
    }

}