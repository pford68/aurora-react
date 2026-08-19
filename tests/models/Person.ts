import {Record} from "../../src";
import type {Struct} from "../../src";

export type Measurements = {
    height: number,
    weight: number,
}
export default class Person extends Record<Struct> {

    set(key: string, value: unknown): void {
        if (key === "measurements") {
            const measurements = this.get(key);
            (measurements as Measurements).height = Number(value);
        } else {
            super.set(key, value);
        }
    }
}