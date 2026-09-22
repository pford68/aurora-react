import {expect} from "vitest";
import {isPlainObject, isPrimitive} from "../validations.ts";
import people from "../../../tests/fixtures/people.json"
import PersonDTO from "../../../tests/models/PersonDTO.ts";
import {StringDTO} from "../../model/dtos.ts";


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

    it("returns false for primitives", () => {
        expect(isPlainObject("aaaa")).toBeFalsy();
        expect(isPlainObject(null)).toBeFalsy();
        expect(isPlainObject(undefined)).toBeFalsy();
        expect(isPlainObject(5)).toBeFalsy();
        expect(isPlainObject(Symbol("first"))).toBeFalsy();
    });

    it("returns false for custom class instances", () => {
        expect(isPlainObject(new PersonDTO(people[0]))).toBeFalsy();
    });
});


describe("isPrimitive", () => {
    it("should return true for any primitive", () => {
        expect(isPrimitive(5)).toBeTruthy();
        expect(isPrimitive("Hi!")).toBeTruthy();
        expect(isPrimitive(Symbol("test"))).toBeTruthy();
        expect(isPrimitive(true)).toBeTruthy();
        expect(isPrimitive(undefined)).toBeTruthy();
        expect(isPrimitive(null)).toBeTruthy();
        expect(isPrimitive(Number("7"))).toBeTruthy();
    });

    it("should return false for any object", () => {
        expect(isPrimitive({})).toBeFalsy();
        expect(isPrimitive(new PersonDTO(people[0]))).toBeFalsy();
        expect(isPrimitive([])).toBeFalsy();
        expect(isPrimitive(new Map())).toBeFalsy();
        expect(isPrimitive(new Set())).toBeFalsy();
        expect(isPrimitive((i: number) => 2 + i)).toBeFalsy();
        expect(isPrimitive(StringDTO)).toBeFalsy();
    });
});