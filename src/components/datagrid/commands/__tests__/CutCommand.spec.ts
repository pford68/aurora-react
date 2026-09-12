import people from "../../../../../tests/fixtures/people.json";
import CutCommand from "../CutCommand.ts";
import CopyCommand from "../CopyCommand.ts";
import {expect} from "vitest";
import ObservableList, {ListItem} from "../../../../model/ObservableList.ts";
import type {Struct} from "../../../../types/types.ts";

describe("CutCommand", () => {
    let list: ObservableList<Struct>;
    let selectedItems: ListItem<Struct>[];

    beforeEach(() => {
        list = new ObservableList<Struct>(people);
        selectedItems = list.slice(1,4);
    });

    describe("execute()", () => {
        it("should add the parameters to sessionStorage", () => {
            const cmd = new CutCommand({selectedItems, columns: ["firstName", "lastName", "age"]}, list);
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
    });

    describe("undo()", () => {
        it("should restore the selected cells", () => {
            const cmd = new CutCommand({selectedItems, columns: ["firstName", "lastName", "age"]}, list);
            cmd.execute();
            cmd.undo();
            [1, 4].forEach((index) => {
                const item = list.get(index);
                expect(item).toBeDefined();
                expect(item?.get("firstName")).not.toBeNull();
                expect(item?.get("lastName")).not.toBeNull();
                expect(item?.get("age")).not.toBeNull();
            })
        });

        it("should restore the selected cells even after sorting", () => {
            const cmd = new CutCommand({selectedItems, columns: ["firstName", "lastName", "age"]}, list);
            cmd.execute();
            list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
            cmd.undo();
            selectedItems.forEach((item) => {
                const currentIndex = list.findIndex(i => i.id == item.id);
                if (currentIndex !== undefined) {
                    const currentItem = list.get(currentIndex);
                    expect(currentItem).toBeDefined();
                    expect(currentItem?.get("firstName")).not.toBeNull();
                    expect(currentItem?.get("lastName")).not.toBeNull();
                    expect(currentItem?.get("age")).not.toBeNull();
                }
            })
        });
    })
})