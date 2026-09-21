import {expect} from "vitest";
import {isPlainObject} from "../validations.ts";
import people from "../../../tests/fixtures/people.json"


describe("isPlainObject", () => {
    it("returns true for object with no key", () => {
        expect(isPlainObject({})).toBeTruthy();
    });

    it("returns true for object with keys", () => {
        expect(isPlainObject(people[0])).toBeTruthy();
    });
})