import {type ReactElement, type RefObject, useState, type ComponentPropsWithoutRef} from "react";
import type {Predicate} from "../../types/types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";


export type StatefulInputProps<T> = ComponentPropsWithoutRef<"input"> & {
    value?: T,
    ref?: RefObject<HTMLInputElement | null>,
    className?: string,
    validator?: Predicate<string | undefined | number | readonly string[]>,
    autoComplete?: boolean,
    format?: string,
}

/**
 * Input elements with a local state, allow them to retain uncommitted changes.
 * StatefulInput can be passed as-is to forwardRef() to expose the input element to
 * components higher up in the tree.  Use InputContainer to do soo, instead of
 * invoked forwardRef directly.
 *
 * @param props
 * @constructor
 */
export default function StatefulInput<T>(props: StatefulInputProps<T>): ReactElement {
    const {
        value: initValue,
        validator,
        className,
        ref,
        onInput,
        autoComplete = false,
    } = props;
    const [value, setValue] = useState<string>(String(initValue));
    const [valid, setValid] = useState<boolean>(() => {
        return validator?.(value) ?? true;
    });

    return (
        <input
            {...props}
            ref={ref}
            value={value ?? initValue}
            onInput={e => {
                const {target} = e;
                if (target instanceof HTMLInputElement) {
                    const updatedValue = target.value ?? null;
                    const result = validator?.(updatedValue) ?? true;
                    setValid(result);
                    setValue(updatedValue);
                    if (result) {
                        onInput?.(e);
                    }
                }
            }}
            className={joinCss(styles.input, !valid ? styles.invalid : "", className)}
            autoComplete={autoComplete ? "on" : "off"}
        />
    );
}
