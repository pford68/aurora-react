import {expect} from "vitest";
import {isPlainObject} from "../validations.ts";
import people from "../../../tests/fixtures/people.json"
import PersonDTO from "../../../tests/models/PersonDTO.ts";


describe("isPlainObject", () => {
    it("returns true for object with no key", () => {
        expect(isPlainObject({})).toBeTruthy();
    });

    it("returns true for object with keys", () => {
        expect(isPlainObject(people[0])).toBeTruthy();
    });

    it("returns false for arrays", () => {
        expect(isPlainObject(people)).toBeFalsy();
    });

    it("returns false for custom class instances", () => {
        expect(isPlainObject(new PersonDTO(people[0]))).toBeFalsy();
    });
})