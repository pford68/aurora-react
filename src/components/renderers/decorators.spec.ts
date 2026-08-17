import {CurrencyDTO, DateDTO, DateTimeDTO, NumberDTO} from "./decorators.ts";

describe("DateDecorator", () => {
    it ("should render as a ISO-formatted Date string by default", () => {
        expect(`${new DateDTO(1786827480000)}`).toBe("2026-08-15");
    });
})

describe("DateTimeDecorator", () => {
    it ("should render as a ISO-formatted Date/Time string by default", () => {
        expect(`${new DateTimeDTO(1786812300000)}`).toBe("2026-08-15T16:45:00.000Z");
    });
})

describe("CurrencyDecorator", () => {
    it ("should render as a currency value (USD) by default", () => {
        expect(`${new CurrencyDTO(15.736777)}`).toBe("$15.74");
        expect(`${new CurrencyDTO(100015.736777)}`).toBe("$100,015.74");
    });

    describe("toString", () => {
        it("should return $0.00 if the value if undefined", () => {
            // @ts-expect-error: the test requires violating the typing on the constructor.
            expect(new CurrencyDTO().toString()).toBe("$0.00");
        });
    })
})

describe("NumberDecorator", () => {
    it ("should render in US format with a scale of 2 by default", () => {
        expect(`${new NumberDTO(15.736777)}`).toBe("15.74");
        expect(`${new NumberDTO(100015.736777)}`).toBe("100015.74");
    });

    describe("valueOf", () => {
        it("should return NaN if the value if undefined", () => {
            // @ts-expect-error: the test requires violating the typing on the constructor.
            expect(new NumberDTO().valueOf()).toBe(Number.NaN);
        });
    })
})