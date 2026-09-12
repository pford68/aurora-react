import SaveCommand from '../SaveCommand.ts';
import people from "../../../../../tests/fixtures/people.json";
import ObservableList, {type Entry} from "../../../../model/ObservableList.ts";
import type {Struct} from "../../../../types/types.ts";


describe('SaveCommand', () => {
    let list:ObservableList<Struct>;
    const TEST_RECORD_INDEX = 1;

    function getUpdates(name :string = "Bob") {
        const record = list.get(TEST_RECORD_INDEX)
        return [{
            index: TEST_RECORD_INDEX,
            record,
            value: {firstName: name},
        }];
    }

    beforeEach(() => {
        list = new ObservableList<Struct>(people);
    })

    it('should update an ObservableList', () => {
        const updates = getUpdates();
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        expect(list.get(1)?.get("firstName")).toBe("Bob");
    });

    it('should undo an update to an ObservableList', () => {
        const updates = getUpdates();
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        cmd.undo();
        expect(list.get(1)?.get("firstName")).toBe("John");
    });

    it('should still undo an update to an ObservableList after sorting', () => {
        const updates = getUpdates();
        const id = list.get(TEST_RECORD_INDEX)?.id;
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        const record = list.find((r: Entry<Struct>) => r.id == id);
        expect(list.findIndex((r: Entry<Struct>) => r.id == id)).not.toBe(TEST_RECORD_INDEX);
        expect(record?.get("firstName")).toBe("John")
    });

    it('should redo an update to an ObservableList', () => {
        const updates = getUpdates("Bill");
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        cmd.undo();
        cmd.redo();
        expect(list.get(1)?.get("firstName")).toBe("Bill")
    });

    it('should redo an update to an ObservableList after sorting', () => {
        const updates = getUpdates("Bill");
        const id = list.get(TEST_RECORD_INDEX)?.id;
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        cmd.redo();
        const record = list.find((r: Entry<Struct>) => r.id == id);
        expect(list.findIndex((r: Entry<Struct>) => r.id == id)).not.toBe(TEST_RECORD_INDEX);
        expect(record?.get("firstName")).toBe("Bill")
    });
});