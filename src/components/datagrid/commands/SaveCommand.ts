import type {Command, Struct} from "../../../types/types.ts";
import ObservableList, {type PartialUpdate} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";


/**
 * For making/undoing changes to existing Records.
 */
export default class SaveCommand<T extends Struct> implements Command {
    static readonly icon: IconProp = "save";
    static readonly name: string = "Save";
    static readonly accelerator: string = "⌘+s";
    #updates: PartialUpdate<T>[];
    #list: ObservableList<T>; // TODO:  Will be needed in CORE-11.


    constructor(list: ObservableList<T>, updates: PartialUpdate<T>[]) {
        this.#list = list;
        this.#updates =  updates;
        this.#updates.forEach(item => item.previous = item.record?.clone())
    }

    redo(): boolean {
        return this.execute();
    }

    undo(): boolean {
        this.#updates
            .forEach(({previous, record}) => {
                if (previous != null && record != null) {
                    this.#list.update(record, previous.getAll());
                }
            });

        return true;
    }

    execute(): boolean {
        const updates = this.#updates;
        if (updates.length === 0) {
            console.warn("No parameters loaded, nothing to execute.")
            return false;
        }

        updates.forEach(({ record, value }) => {
            if (!record) return;
            const currentIndex = this.#list.findIndex(item => item.id == record.id);
            if (currentIndex != null && currentIndex > -1) {
                this.#list.update(record, record.merge(value));
            }
        });

        return true;
    }

}