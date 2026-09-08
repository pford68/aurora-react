import peopleData from "../../tests/fixtures/people.json";
import ObservableList, {ListItem} from "../model/ObservableList.ts";
import type {Struct} from "../types/types";
import {fail} from "node:assert";

function testAllKeys(r: ListItem<Struct>) {
    expect(r.get("firstName")).toBe("Adolis");
    expect(r.get("lastName")).toBe("Garcia");
    expect(r.get("age")).toBe(29);
    expect(r.get("active")).toBe(true);
    expect(r.get("lastUpdated")).toBe(1704401089);
    const m = r.get("measurements");
    // @ts-expect-error: m is of type unknown
    expect(m.height).toBe(70);
}


describe("ListItem", () => {
    let record: ListItem<Struct>;
    let people: Struct[];

    beforeEach(() => {
        people = structuredClone(peopleData);
        record = new ListItem(people[5]);
    });

    describe("get", () => {
        it("should return the value for the specified key", () => {
            expect(record.get("firstName")).toBe("Adolis");
        });

        it("should return undefined if the key does not exist", () => {
            expect(record.get("benchpress")).toBeUndefined()
        });
    });

    describe("getAll", () => {
        it("should return the entire set of data in the record as key/value pairs (an Object)", () => {
            const result = record.getAll();
            expect(result["firstName"]).toBe("Adolis");
            expect(result["lastName"]).toBe("Garcia");
            expect(result["age"]).toBe(29);
            expect(result["active"]).toBe(true);
            expect(result["lastUpdated"]).toBe(1704401089);
            expect(result["measurements"]).not.toBeUndefined();
        })
    })

    describe("clone", () => {
        it("should create a new Record with all data from the cloned Record", () => {
            const clone = record.clone();
            testAllKeys(clone);
        });

        it("should not create a new id for the new Record", () => {
            const clone = record.clone();
            expect(clone.id).toEqual(record.id);
        })
    });

    describe("The `deleted` property", () => {
        it("should be readable", () => {
            expect(record.deleted).toBeFalsy();
        });
    });

    describe("The `id` property", () => {
        it("should be readable", () => {
            expect(record.id).not.toBeUndefined();
        });

        it("should be immutable", () => {
            try {
                // @ts-expect-error: intentionally causing an error here--assigning a value to a readonly property..
                record.id = "gjfkghgh";
                fail("We should not reach this point.")
            } catch (e:unknown) {
                if (e instanceof Error) {
                    console.warn(e.message);
                } else {
                    console.warn("An unexpected error occurred.")
                }
            }
        });
    });
});



describe("ObservableList", () => {
    let list: ObservableList<Struct>;
    let people: Struct[];

    beforeEach(() => {
        people = structuredClone(peopleData);
        list = new ObservableList(people);
    });

    describe("get", () => {
        it("should get the Record at the specified index", () => {
            const record = list.get(5);
            expect(record instanceof ListItem).toBeTruthy();
        });

        it("should get the Record at the specified index", () => {
            const record = list.get(5);
            expect(record).toBeDefined();
            if (record != null) {
                testAllKeys(record);
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("getAll", () => {
        it("should return all non-deleted items in the list", () => {
            expect(list.getAll().length).toBe(6);
            const record = list.get(1);
            if (record != null) {
                record.deleted = true;
                expect(list.getAll().length).toBe(5);
            } else {
                fail("The record should have been found.")
            }
        });
    })

    describe("insertAt", () => {
        it("should take an updated record and insert it at the specified index", () => {
            const index = 2;
            const oldRecord = list.get(index);
            if (oldRecord != null) {
                const state = {id: oldRecord.id, deleted: false};
                const newItem = new ListItem({"firstName": "Jack"}, state);
                list.insertAt(index, newItem.getAll());
                expect(list.get(index)?.get("firstName")).toBe("Jack");
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("insertBefore", () => {
        beforeEach(() => {

        })

        it("should insert it at the specified index", () => {
            const index = 2;
            const oldRecord = list.get(index);
            if (oldRecord != null) {
                const state = {id: oldRecord.id, deleted: false};
                const newItem = new ListItem({"firstName": "Jack"}, state);
                list.insertAt(index, newItem.getAll());
                expect(list.get(index)?.get("firstName")).toBe("Jack");
            } else {
                fail("The record should have been found.")
            }
        });

        it("should shift subsequent records down by one index", () => {
            const index = 2;
            const oldRecord = list.get(index);
            if (oldRecord != null) {
                const state = {id: oldRecord.id, deleted: false};
                const newItem = new ListItem({"firstName": "Jack"}, state);
                list.insertAt(index, newItem.getAll());
                expect(list.get(index)?.get("firstName")).toBe("Jack");
            } else {
                fail("The record should have been found.")
            }
        });
    })

    describe("batchUpdate", () => {
        it("should take a list of  updated records and insert each at the specified index", () => {
            const [first, second] = list.slice(2, 4);
            if (first != null && second != null) {
                const item1 = ListItem.from(first, {"firstName": "Jack"});
                const item2 = ListItem.from(second, {"firstName": "aaaak"});
                const updates = [
                    {index: 2, record: item1},
                    {index: 3, record: item2},
                ]
                list.batchUpdate(updates);
                expect(list?.get(2)?.get("firstName")).toBe("Jack");
                expect(list?.get(3)?.get("firstName")).toBe("aaaak");
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("find", () => {
        it("should return the first Record that matches the criteria", () => {
            let record = list
                .find((item) => item.get("firstName") == "Adolis");
            expect(record).toBeDefined();
            // @ts-expect-error: we test for undefined above.
            testAllKeys(record);

            record = list
                .find((item) => item.get("active") == true);
            expect(record?.get("firstName")).toBe("Philip");
        });
    });

    describe("findIndex", () => {
        it("should return the index first Record that matches the criteria", () => {
            let index = list
                .findIndex((item) => item.get("firstName") == "Adolis");
            expect(index).toBe(5);

            index = list
                .findIndex((item) => item.get("active") == true);
            expect(index).toBe(0);
        });
    });

    describe("filter", () => {
        it("should only the records matching the criteria", () => {
            const records = list.filter(item => item.get("active") === true);
            expect(records.length).toBe(4);
        });
    });

    describe("deleteAt", () => {
        it("should flag the item at the specified index for deletion", () => {
            const record = list.get(1);
            list.deleteAt(1);
            expect(record?.deleted).toBeTruthy();
            expect(list.length).toBe(5);
        });

        it("should perform a soft delete that is reversible", () => {
            const record = list.get(1);
            list.deleteAt(1);
            if (record != null) {
                record.deleted = false;
                expect(list.length).toBe(6);
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("slice", () => {
        it("should return the Records between the specified indices exclusive", () => {
            const records = list.slice(1,4);
            expect(records.length).toBe(3);
        });
    });
})