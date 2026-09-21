import undoable  from "../undoable.ts";
import stackManager from './../../util/StackManager.ts';
import type {Command} from "../../types/types.ts";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import type {MockInstance} from "vitest";

let testValue: string | null = null;


class TestClickCommand implements Command {
    redo(): boolean {return true;}
    name?: string | undefined;
    icon?: IconProp | undefined;
    accelerator?: string | undefined;
    @undoable
    execute(): boolean { return true; }
    undo(): boolean { return true; }
}

/*
Create an inheritance chain where both classes have the decorator.
This addresses an initial bug.
*/
class GrandparentCommand implements Command {
    redo(): boolean {return true;}
    @undoable
    execute(): boolean { return true; }
    undo(): boolean { return true; }
}

class LeafNodeCommand extends GrandparentCommand {
    // Use a native private field to guarantee the receiver issue doesn't return
    #secretToken = 'secure_data';

    @undoable
    execute() {
        // Accessing the private field to ensure no "Receiver must be an instance" crash
        testValue = this.#secretToken;
        return true;
    }
}

describe('@undoable Decorator', () => {
    let executeSpy: MockInstance;

    beforeEach(() => {
        executeSpy = vi.spyOn(stackManager, "execute")
        stackManager.clear();
        executeSpy.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should register when execute runs', () => {
        const instance = new TestClickCommand();
        instance.execute();

        expect(executeSpy).toHaveBeenCalledTimes(1);
        expect(executeSpy).toHaveBeenCalledWith(instance);
    });

    it('should not register on instantiation', () => {
        const instance = new TestClickCommand();
        expect(executeSpy).toHaveBeenCalledTimes(0);
        instance.execute();
    });

    it('should register a subclass exactly once even if it calls super.execute()', () => {
        const childInstance = new LeafNodeCommand();
        expect(() => childInstance.execute()).not.toThrow();
        expect(executeSpy).toHaveBeenCalledTimes(1);
        expect(executeSpy).toHaveBeenCalledWith(childInstance);
        expect(testValue).toBe('secure_data');
    });

    it('should bypass registration loops completely when StackManager is replaying history', () => {
        const instance = new TestClickCommand();
        vi.spyOn(stackManager, 'replaying', 'get').mockReturnValue(true);

        instance.execute();
        expect(executeSpy).toHaveBeenCalledTimes(0);
    });
});
