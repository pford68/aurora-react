import {CurrencyDecorator, DateDecorator, DateTimeDecorator} from "./decorators.ts";

describe("DateDecorator", () => {
    it ("should render as a ISO-formatted Date string by default", () => {
        expect(`${new DateDecorator(1786827480000)}`).toBe("2026-08-15")
    });

    it ("should render as a locale-formatted Date string when locale is specified", () => {
        expect(`${new DateDecorator(1786827480000, "en-US")}`).toBe("08/15/2026");
    });
})

describe("DateTimeDecorator", () => {
    it ("should render as a ISO-formatted Date/Time string by default", () => {
        expect(`${new DateTimeDecorator(1786812300000)}`).toBe("2026-08-15T16:45:00.000Z")
    });

    it ("should render as locale-formatted Date/Time string when a locale is specified", () => {
        expect(`${new DateTimeDecorator(1786812300000, "en-US")}`).toBe("08/15/2026, 12:45 PM")
        expect(`${new DateTimeDecorator(1786812300000, "fr-FR")}`).toBe("15/08/2026 12:45")
    });
})

describe("CurrencyDecorator", () => {
    it ("should render as a currency value (USD) by default", () => {
        expect(`${new CurrencyDecorator(15.736777)}`).toBe("$15.74")
        expect(`${new CurrencyDecorator(100015.736777)}`).toBe("$100,015.74")
    });
})

describe("NumberDecorator", () => {
    it ("should render in US format with a scale of 2 by default", () => {
        expect(`${new CurrencyDecorator(15.736777)}`).toBe("$15.74")
        expect(`${new CurrencyDecorator(100015.736777)}`).toBe("$100,015.74")
    });
})