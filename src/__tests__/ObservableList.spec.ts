import peopleData from "../../tests/fixtures/people.json";
import ObservableList, {type Entry, ListItem} from "../model/ObservableList.ts";
import type {Struct} from "../types/types";
import {fail} from "node:assert";
import Person, {type Measurements} from "../../tests/models/Person.ts";

function testAllKeys(r: Entry<Struct>) {
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

    describe("merge", () => {
        it("should replace the values at the specified keys", () => {
            const merged = record.merge({firstName: "Fred"});
            expect(merged.get("firstName")).toBe("Fred");
            expect(merged.get("lastName")).toBe("Garcia");
            expect(merged.get("age")).toBe(29);
            expect(merged.get("active")).toBe(true);
            expect(merged.get("lastUpdated")).toBe(1704401089);
        });

        it("should be extensible to know how to save changes to complex properties", () => {
            const person = new Person(people[5]);
            person.set("measurements", 900);
            expect((person.get("measurements") as Measurements).height).toBe(900);
        })
    });

    describe("clone", () => {
        it("should create a new item with all data from the cloned item", () => {
            const clone = record.clone();
            testAllKeys(clone);
        });

        it("should copy the id from the original item", () => {
            const clone = record.clone();
            expect(clone.id).toEqual(record.id);
        })
    });

    describe("from", () => {
        it("should copy all data from the specified ListItem", () => {
            const newRecord = ListItem.from(record);
            testAllKeys(newRecord);
        });

        it("should augment the original record", () => {
            const newRecord = ListItem.from(record, {
                country: "US",
                HR: "a lot",
                state: "Texas",
            });
            expect(newRecord.get("state")).toBe("Texas");
            expect(newRecord.get("HR")).toBe("a lot");
            expect(newRecord.get("country")).toBe("US");
            testAllKeys(newRecord);
        });
    });

    describe("The `deleted` property", () => {
        it("should be readable", () => {
            expect(record.deleted).toBeFalsy();
        });

        it("should be writable", () => {
            record.deleted = true;
            expect(record.deleted).toBeTruthy();
        });
    });

    describe("The `id` property", () => {
        it("should be readable", () => {
            expect(record.id).not.toBeUndefined();
        });

        it("should not be writable", () => {
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
        it("should get the item at the specified index", () => {
            const record = list.get(5);
            expect(record instanceof ListItem).toBeTruthy();
        });

        it("should get the item at the specified index", () => {
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

    describe("update", () => {
        const testUpdate = (record: Entry<Struct>, target?: string) => {
            const newRecord = record.merge({firstName: "Jack"});
            list.update(target ?? record, newRecord.getAll());
            const updatedRecord = list.get(2);
            expect(updatedRecord?.get("firstName")).toBe("Jack");
            expect(updatedRecord?.get("lastName")).toBe("Seager");
        }

        it("should update the specified item", () => {
            const record = list.get(2);
            if (record != null) {
                testUpdate(record);
            } else {
                fail("The record should have been found.")
            }
        });

        it("should update the record at the specified ID", () => {
            const record = list.get(2);
            const id = record?.id;
            if (record != null) {
                testUpdate(record, id)
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("batchUpdate", () => {
        it("should take a list of  updated list items and insert each at the specified index", () => {
            const [first, second] = list.slice(2, 4);
            if (first != null && second != null) {
                const updates = [
                    {index: 2, target: first, value: {firstName: "Jack"}},
                    {index: 3, target: second, value: {firstName: "aaaak"}},
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
        it("should return the first item that matches the criteria", () => {
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
        it("should return the index first item that matches the criteria", () => {
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

    describe("delete", () => {
        it("should flag the item at the specified index for deletion", () => {
            const record = list.get(1);
            if (record != null) {
                list.delete(record);
                expect(record?.deleted).toBeTruthy();
                //expect(list.length).toBe(5);
            } else {
                fail("The record should have been found.")
            }
        });

        it("should perform a soft delete that is reversible", () => {
            const record = list.get(1);
            if (record != null) {
                list.delete(record);
                record.deleted = false;
                expect(list.length).toBe(6);
            } else {
                fail("The record should have been found.")
            }
        });
    });

    describe("slice", () => {
        it("should return the list items between the specified indices exclusive", () => {
            const records = list.slice(1,4);
            expect(records.length).toBe(3);
        });
    });
})