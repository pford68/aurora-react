import CopyCommand from "./CopyCommand.ts";
import type {Struct} from "../../../types/types.ts";
import {ListItem} from "../../../model/ObservableList.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";

export default class CutCommand<T extends Struct> extends CopyCommand<T> {

    icon: IconProp = "cut";
    name: string = "Cut";
    readonly accelerator: string = "⌘+x";
    readonly #previous: {id: string | number, clone: ListItem<T>}[];

    constructor(selectedItems: ListItem<T>[]) {
        super(selectedItems);
        this.#previous = [];
    }

    redo(): boolean {
        super.execute();
        return this.#execute(false);
    }

    undo(): boolean {
        this.#previous.forEach((prevRecord) => {
            const currentIndex = this.selectedItems.findIndex(record => record.id === prevRecord.id);
            record?.copy(prevRecord.clone);
            if (currentIndex < -1) {
                const existingItem = this.selectedItems[currentIndex];

            }
        });

        return true;
    }

    execute(): boolean {
        super.execute();
        return this.#execute(true);
    }

    #execute(doClone: boolean): boolean {
        const params = this.getParameters();
        const param = params[params.length - 1];
        const {columnNames} = param;
        this.selectedItems.forEach(item => {
            if (doClone) this.#previous.push({id: item.id, clone: item.clone()});

            columnNames.forEach(name => {
                item.set(name, null);
            })
        });
        return true;
    }

}