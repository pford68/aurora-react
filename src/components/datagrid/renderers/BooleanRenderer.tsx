import React, {type RefObject} from "react";
import {joinCss} from "../../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {ValidatedInputProps} from "./renderers.types.ts";
import StatefulInput from "./StatefulInput.tsx";
import type {Predicate} from "../../../types/types.ts";

type LocalProps<T> = Omit<ValidatedInputProps, keyof T> & T;
export type BooleanRendererProps = LocalProps<{
    value: boolean,
    ref?: RefObject<HTMLInputElement | null>,
    className?: string,
    validator?: Predicate<string>,
    autoComplete?: boolean,
}>;

export default function BooleanRenderer(props: BooleanRendererProps): React.ReactElement {
    const {
        name,
        ref,
        className,
        value,
        type = "text",
    } = props;

    const overrides = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(styles.renderer, styles.boolean, styles.active, className),
        // "switch" is weeded out, but format == switch is handled later on.
        checked: value === true,
        type: ["text", "switch", "checkbox"].includes(type) ? type : "text",
    };

    if (type === "switch") {
        return (
            <label className={styles.switch}>
                <StatefulInput {...overrides} ref={ref} type="checkbox" />
                <span className={joinCss(styles.slider, styles.round)}></span>
            </label>
        )
    }

    return (
        <StatefulInput {...overrides} ref={ref} type={type}/>
    );
}
