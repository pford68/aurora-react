import {type ReactElement, type RefObject, useState} from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "../datagrid/Renderers.module.css";
import type {Predicate} from "../../types/types.ts";
import type {RendererProps} from "../datagrid/Datagrid.types.ts";


type LocalOverrides = {
    value?: string | number | boolean,
    validator?: Predicate<string>,
    ref?: RefObject<HTMLInputElement | null>,
    autoComplete?: boolean,
}
export type StatefulInputProps = Omit<RendererProps, keyof LocalOverrides> & LocalOverrides;
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
        autoComplete = false,
        onInput,
        onChange,
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
                    onInput?.(e)
                }
            }}
            onChange={e => {
                const {target} = e;
                if (target instanceof HTMLInputElement) {
                    if (valid) {
                        const updatedValue = target.value ?? null;
                        setValue(updatedValue);
                        onChange?.(e);
                    }
                }
            }}
            className={joinCss(styles.input, !valid ? styles.invalid : "", className)}
            autoComplete={autoComplete ? "on" : "off"}
        />
    );
}
