import React from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {RendererProps} from "./types.ts";
import StatefulInput from "./StatefulInput.tsx";
import type {Struct} from "../../types/types.ts";

export type BooleanRendererProps<T extends Struct> = RendererProps<boolean, T> & {
    value: boolean,
    type: "checkbox" | "switch" | "text",
};

export default function BooleanRenderer<T extends Struct>(props: BooleanRendererProps<T>): React.ReactElement {
    const {
        name,
        ref,
        className,
        value,
        type,
    } = props;

    const overrides = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(styles.renderer, styles.boolean, styles.active, className),
        // "switch" is weeded out, but format == switch is handled later on.
        checked: value === true,
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
