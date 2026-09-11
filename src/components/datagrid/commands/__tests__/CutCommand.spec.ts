import people from "../../../../../tests/fixtures/people.json";
import Person from "../../../../../tests/models/Person.ts";
import CutCommand from "../CutCommand.ts";
import CopyCommand from "../CopyCommand.ts";
import {expect} from "vitest";

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
            const clipboardItem = sessionStorage.getItem(CopyCommand.TOKEN);
            expect(clipboardItem).toBeDefined();
            expect(clipboardItem).not.toBeNull();

            const parsedItem = JSON.parse(clipboardItem ?? "");
            const {payload} = parsedItem;
            expect(typeof clipboardItem).toBe("string");
            expect(payload.data[1]["firstName"]).toBe("Corey")
            expect(payload.data[1]["lastName"]).toBe("Seager");
            expect(payload.data[2]["firstName"]).toBe("Luka");
            expect(payload.data[2]["lastName"]).toBe("Doncic");
            expect(payload.data[0]["firstName"]).toBe("John");
            expect(payload.data[0]["lastName"]).toBe("Smith");
        });
    })
})