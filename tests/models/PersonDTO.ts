import {AbstractDTO, BooleanDTO, DateDTO, NumberDTO, StringDTO} from "../../src/model/dtos.ts";
import type {Measurements} from "./Person.ts";


export default class PersonDTO {
    firstName: StringDTO;
    lastName: StringDTO;
    amount: NumberDTO;
    age: NumberDTO;
    active: BooleanDTO;
    lastUpdated: DateDTO;
    measurements: MeasurementsDTO;


    constructor(data: Record<string, unknown>) {
        this.firstName = new StringDTO(String(data.firstName));
        this.lastName = new StringDTO(String(data.lastName));
        this.amount = new NumberDTO(Number(data.amount));
        this.age = new NumberDTO(Number(data.age));
        this.lastUpdated = new DateDTO(Number(data.lastUpdated));
        this.active = new BooleanDTO(Boolean(data.active));
        this.measurements = new MeasurementsDTO(data.measurements as Measurements);
    }
}

export class MeasurementsDTO extends AbstractDTO<number>{
    #height: number;
    #weight: number;

    constructor(value:unknown) {
        super()
        const v = value as Measurements;
        this.#height = v?.height ?? 0;
        this.#weight = v?.weight ?? 0;
    }

    toString(): string {
        return String(this.valueOf());
    }

    get value(): number {
        return this.#height;
    }

    valueOf(): number {
        return this.value;
    }

    toJSON(): { [p: string]: number | undefined} {
        return super.toJSON();
    }

    clone(value: Measurements | number): AbstractDTO<number> {
        if (typeof value === "object") {
            return new MeasurementsDTO(value)
        }
        return new MeasurementsDTO({height: value, weight: this.#weight});
    }

    get formType(): string {
        return "number";
    }

    [Symbol.toPrimitive](hint: "string" | "number" | "boolean" | "default"): string | number | boolean {
        switch (hint) {
            case "number":
                return this.#height;
            default:
                return String(this.#height);
        };
    }
}