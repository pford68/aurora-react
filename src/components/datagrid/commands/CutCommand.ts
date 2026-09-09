import CopyCommand, {type CopyConfig} from "./CopyCommand.ts";
import type {Struct} from "../../../types/types.ts";
import {Record} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";

export default class CutCommand<T extends Struct> extends CopyCommand<T> {

    static readonly icon: IconProp = "cut";
    static readonly name: string = "Cut";
    static readonly accelerator: string = "⌘+x";
    readonly #previous: {id: string, clone: Record<T>}[];

    constructor(config: CopyConfig<T>) {
        super(config);
        this.#previous = [];
    }

    redo(): boolean {
        super.execute();
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            const record = this.selectedItems.find(record => record.id === prevRecord.id);
            record?.copy(prevRecord.clone);
        });

        return true;
    }

    execute(): boolean {
        super.execute();
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        this.selectedItems.forEach(item => {
            if (doClone) this.#previous.push({id: item.id, clone: item.clone()});

            this.columns.forEach(name => {
                item.set(name, null);
            })
        });
        return true;
    }

}