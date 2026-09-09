import people from "../../../../../tests/fixtures/people.json";
import Person from "../../../../../tests/models/Person.ts";
import CutCommand from "../CutCommand.ts";

describe("CutCommand", () => {
    let list:Person[];

    beforeEach(() => {
        //mockStore = {};
        list = people.map(person => new Person(person));
    });

    describe("execute()", () => {
        let selectedItems: Person[];

        beforeEach(() => {
            selectedItems = list.slice(1,4);
        });

        it("should add the parameters to sessionStorage", () => {
            const cmd = new CutCommand({selectedItems, columns: ["firstName", "lastName", "age"]});
            cmd.execute();

            // Inspecting the clipboard item
            const item = sessionStorage.getItem(CutCommand.TOKEN);
            const EXPECTED_ENTRIES = 3;
            expect(item).toBeDefined();
            expect(typeof item).toBe("string");
            expect(item?.includes("Corey")).toBeTruthy();
            expect(item?.includes("Seager")).toBeTruthy();
            expect(item?.includes("Luka")).toBeTruthy();
            expect(item?.includes("Doncic")).toBeTruthy();
            expect(item?.includes("John")).toBeTruthy();
            expect(item?.includes("Smith")).toBeTruthy();
            expect(item?.match(/firstName/g)?.length).toBe(EXPECTED_ENTRIES);
            expect(item?.match(/lastName/g)?.length).toBe(EXPECTED_ENTRIES);
            expect(item?.match(/"age"/g)?.length).toBe(EXPECTED_ENTRIES);
        });
    })
})