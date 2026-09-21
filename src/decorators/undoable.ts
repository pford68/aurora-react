import stackManager from "../util/StackManager.ts";
import type {Command} from "../types/types.ts";

/**
 * Decorator for commands, automatically adding them to the StackManager
 * when they are executed, to support application-wide undo/redo operations.
 *
 * @param targetMethod
 * @param context
 */
export default function undoable<This extends Command, Args extends unknown[], Return>(
    targetMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return> & { name: "execute" }
) {
    if (context.kind !== "method") {
        throw new Error("@undoable can only be used on class methods");
    }


   /*
   Register an initializer that runs when the enclosing instance is created.
   This binds the execution routing directly to the instance, preventing prototype
   down-compilation artifacts in batch test environments.
    */
    context.addInitializer(function (this: This) {
        const originalMethod = targetMethod;

        this.execute = function (this: This, ...args: unknown[]): boolean {
            /*
            If the StackManager is playing back history (undo/redo),
            let the underlying logic run natively without intercepting it.
             */
            if (stackManager.replaying) {
                return originalMethod.apply(this, args  as unknown as Args) as unknown as boolean;
            }

            /*
            At this point, we are in a fresh user interaction. Route it to the StackManager.
            The StackManager sets 'replaying = true' and invokes this method again without
            prototype confusion.
             */
            stackManager.execute(this);

            return true;
        };
    });
}