import {getDecoratorByType} from "./typeInference.ts";
import {expect} from "vitest";
import {BooleanDTO, DateDTO, NumberDTO, StringDTO} from "./decorators.ts";


describe("getDecoratorByType", () => {
    it("should return the decorator for the specified type", () => {
        const Decorator = getDecoratorByType(true, "date");
        // @ts-expect-error:  The test is to ensure that the "type" parameter overrides the value.
        expect(new Decorator(new Date()).constructor).toBe(DateDTO);
    });

    it("should return the decorator for the specified object, if type is not present/found", () => {
        const Decorator = getDecoratorByType(Number(5));
        expect(new Decorator(5).constructor).toBe(NumberDTO);
    });

    it("should return the renderer for the specified primitive value, if type is not present/found", () => {
        const n = 5;
        let Decorator = getDecoratorByType(n);
        expect(new Decorator(n).constructor).toBe(NumberDTO);

        const p = true;
        const Decorator2 = getDecoratorByType(p);
        expect(new Decorator2(p).constructor).toBe(BooleanDTO);

        const s = "Hi!"
        const Decorator3 = getDecoratorByType(s);
        expect(new Decorator3(s).constructor).toBe(StringDTO);
    });

    it("should return a StringRenderer for unregistered types", () => {
        const value = {name: "TestObject"};
        const Decorator = getDecoratorByType(value);
        expect(new Decorator(value).constructor).toBe(StringDTO);
    });
})