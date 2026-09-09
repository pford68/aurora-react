import SaveCommand from '../SaveCommand.ts';
import people from "../../../../../tests/fixtures/people.json";
import Person from "../../../../../tests/models/Person.ts";
import ObservableList, {Record} from "../../../../model/ObservableList.ts";
import type {Struct} from "../../../../types/types.ts";


describe('SaveCommand', () => {
    let list:ObservableList<Struct>;
    const index = 1;

    function getUpdates(name :string = "Bob") {
        const record = list.get(index)
        return [{
            record,
            value: {firstName: name},
        }];
    }

    beforeEach(() => {
        list = new ObservableList(people.map(person => new Person(person)));
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
        const id = list.get(index)?.id;
        const cmd = new SaveCommand(list, updates);
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        const record = list.find((r: Record<Struct>) => r.id === id);
        expect(list.findIndex((r: Record<Struct>) => r.id === id)).not.toBe(1);
        expect(record?.get("firstName")).toBe("John")
    });

    it('should redo an update to an ObservableList', () => {
        const updates = getUpdates("Bill");
        const cmd = new SaveCommand(list, updates);
        const id = list.get(1)?.id;
        cmd.execute();
        list.sort((a, b) => Number(a.get("age")) - Number(b.get("age")));
        cmd.undo();
        cmd.redo();
        const record = list.find((r: Record<Struct>) => r.id === id);
        expect(list.findIndex((r: Record<Struct>) => r.id === id)).not.toBe(1);
        expect(record?.get("firstName")).toBe("Bill")
    });
});