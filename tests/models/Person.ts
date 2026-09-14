import {ListItem} from "../../src";
import type {Struct} from "../../src";

export type Measurements = {
    height: number,
    weight: number,
}
export default class Person extends ListItem<Struct> {

    constructor(data: Struct) {
        super(data);
    }
}