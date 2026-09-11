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
    // @ts-expect-error
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
            .forEach(({record, previous}) => {
                if (previous != null) {
                    record?.copy(previous);
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
            (Object.keys(value) as Array<keyof typeof value>).forEach(key => {
                // TODO: List items will be immutable in CORE-11.
                record.set(String(key), value[key]);
            });
        });

        return true;
    }

}