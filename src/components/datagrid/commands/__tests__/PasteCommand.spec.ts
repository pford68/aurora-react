import people from "../../../../../tests/fixtures/people.json";
import type {Struct} from "../../../../types/types.ts";
import PasteCommand from "../PasteCommand.ts";
import CopyCommand from "../CopyCommand.ts";
import ObservableList from "../../../../model/ObservableList.ts";

describe("PasteCommand", () => {
    let list:ObservableList<Struct>;
    let colNames: string[];

    const config = () => {
        return {
            rowIndex: 0,
            colIndex: 1,
            items: list,
            columns: Object.keys(people[0])};
    }

    beforeEach(() => {
        list = new ObservableList<Struct>(people);
        const items = people.slice(4);
        const subItems = items.map(item => {
            return {
                active: item.active,
                age: item.age,
                lastName: item.lastName,
            };
        });
        colNames = ["active", "age", "lastName"];
        const data = JSON.stringify(subItems);
        sessionStorage.setItem(
            CopyCommand.TOKEN,
            `{ "payload": {"data": ${data}, "columnNames": ${JSON.stringify(colNames)}}}`
        );
    });

    it("should update the selected records", () => {
        const cmd = new PasteCommand(config());
        cmd.execute();
        let record = list.get(0);
        expect(record?.get("lastName")).toBe(false);
        expect(record?.get("amount")).toBe(55);
        expect(record?.get("lastUpdated")).toBe("Sanders");

        record = list.get(1);
        expect(record?.get("lastName")).toBe(true);
        expect(record?.get("amount")).toBe(29);
        expect(record?.get("lastUpdated")).toBe("Garcia");
    });

    it("should not update the unselected records", () => {
        const cmd = new PasteCommand(config());
        cmd.execute();
        const record = list.get(2);
        expect(record?.get("lastName")).toBe("Seager");
        expect(record?.get("amount")).toBe(55.1);
        expect(record?.get("lastUpdated")).toBe(1704401089);
    });

    it("should not update unselected columns in selected records", () => {
        const cmd = new PasteCommand(config());
        cmd.execute();
        const record = list.get(0);
        expect(record?.get("firstName")).toBe("Philip");
        expect(record?.get("active")).toBe(true);
        expect(record?.get("age")).toBe(29);
    });

    it("should successfully undo paste operations", () => {
        const cmd = new PasteCommand(config());
        cmd.execute();
        cmd.undo();
        let record = list.get(0);
        expect(record?.get("lastName")).toBe("Ford");
        expect(record?.get("amount")).toBe(77.21);
        expect(record?.get("lastUpdated")).toBe(1704401089);

        record = list.get(1);
        expect(record?.get("lastName")).toBe("Smith");
        expect(record?.get("amount")).toBe(33.33);
        expect(record?.get("lastUpdated")).toBe(1704401089);
    });

    it("should successfully undo paste operations even after sorting", () => {
        const cmd = new PasteCommand(config());
        const origialRecords = list.slice(0,2);
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();

        let currentIndex = list.findIndex(i => i.id == origialRecords[0].id);
        let record = currentIndex != null ? list.get(currentIndex) : null
        expect(record?.get("lastName")).toBe("Ford");
        expect(record?.get("amount")).toBe(77.21);
        expect(record?.get("lastUpdated")).toBe(1704401089);

        currentIndex = list.findIndex(i => i.id == origialRecords[1].id);
        record = currentIndex ? list.get(currentIndex) : null;
        expect(record?.get("lastName")).toBe("Smith");
        expect(record?.get("amount")).toBe(33.33);
        expect(record?.get("lastUpdated")).toBe(1704401089);
    });
})