import {type ReactElement, type RefObject, useState, useEffect, type ComponentPropsWithoutRef} from "react";
import type {Predicate} from "../../../types/types";
import {joinCss} from "../../../util/utils";
import styles from "./Renderers.module.css";


type StatefulInputProps = ComponentPropsWithoutRef<"input"> & {
    ref?: RefObject<HTMLInputElement | null>,
    className?: string,
    validator?: Predicate<string | undefined | number | readonly string[]>,
    autoComplete?: boolean,
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
export default function StatefulInput(props: StatefulInputProps): ReactElement {
    const {
        value: initValue,
        validator,
        className,
        ref,
        onInput,
        autoComplete,
    } = props;
    const [value, setValue] = useState(initValue);
    const [valid, setValid] = useState(true);

    useEffect(() => {
        if (!(validator?.(value) ?? true)) {
            setValid(false);
        }
    }, []);


    return (
        <input
            {...props}
            ref={ref?.current !== undefined ? ref : undefined}
            value={value ?? initValue}
            onInput={e => {
                const {target} = e;
                if (target instanceof HTMLInputElement) {
                    const updatedValue = target.value ?? null;
                    const result = validator?.(updatedValue) ?? true;
                    setValid(result);
                    setValue(updatedValue);
                    if (result && onInput != null) {
                        onInput?.(e);
                    }
                }
            }}
            className={joinCss(styles.input, !valid ? styles.invalid : "", className)}
            autoComplete={autoComplete === true ? "on" : "off"}
        />
    );
}
