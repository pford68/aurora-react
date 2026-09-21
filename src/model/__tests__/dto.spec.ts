import {BooleanDTO, CurrencyDTO, DateDTO, DateTimeDTO, NumberDTO} from "../dtos.ts";

describe("DateDTO", () => {
    describe("String coercion", () => {
        it("should render as a ISO-formatted Date string by default", () => {
            expect(`${new DateDTO(1786827480000)}`).toBe("2026-08-15");
        });
    });
})

describe("DateTimeDTO", () => {
    describe("String coercion", () => {
        it("should render as a ISO-formatted Date/Time string by default", () => {
            expect(`${new DateTimeDTO(1786812300000)}`).toBe("2026-08-15T16:45:00.000Z");
        });
    });
})

describe("CurrencyDTO", () => {
    describe("String coercion", () => {
        it("should render as a currency value (USD) by default", () => {
            expect(`${new CurrencyDTO(15.736777)}`).toBe("$15.74");
            expect(`${new CurrencyDTO(100015.736777)}`).toBe("$100,015.74");
        });

        it("should return $0.00 if the value is undefined", () => {
            expect(`${new CurrencyDTO()}`).toBe("$0.00");
        });
    });

    describe("Number coercion", () => {
        it("should return 0 if the value is undefined", () => {
            const dto = new CurrencyDTO();
            expect(Number(dto)).toBe(0);
        })
    });
})

describe("NumberDTO", () => {
    describe("String coercion", () => {
        it("should render in US format with a scale of 2 by default", () => {
            expect(`${new NumberDTO(15.736777)}`).toBe("15.74");
            expect(`${new NumberDTO(100015.736777)}`).toBe("100015.74");
        });
    });

    describe("Number coercion", () => {
        it("should return NaN if the value if undefined", () => {
            const dto = new NumberDTO();
            expect(Number(dto)).toBe(Number.NaN);
        });
    });
})

describe("BooleanDTO", () => {
    it("should return the configured formType", () => {
        const dto = new BooleanDTO(true, {formType:"switch"});
        expect(dto.formType).toBe("switch");
    });

    describe("String coercion", () => {
        it("should render as \"true\" or \"false\" depending on the value", () => {
            expect(`${new BooleanDTO(true)}`).toBe("true");
            expect(`${new BooleanDTO(false)}`).toBe("false");
        });
    });

    describe("Number coercion", () => {
        it("should return 1 if the value is true", () => {
            const dto = new BooleanDTO(true);
            expect(Number(dto)).toBe(1);
        });

        it("should return 0 if the value is false", () => {
            const dto = new BooleanDTO(false);
            expect(Number(dto)).toBe(0);
        });

        it("should return 0 if the value is undefined", () => {
            const dto = new BooleanDTO();
            expect(Number(dto)).toBe(0);
        });
    });
});