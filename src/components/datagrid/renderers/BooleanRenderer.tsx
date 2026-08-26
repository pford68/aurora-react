import React, {type RefObject} from "react";
import {joinCss} from "../../../util/utils.ts";
import styles from "./Renderers.module.css";
import StatefulInput from "./StatefulInput.tsx";
import type {Consumer, Predicate} from "../../../types/types.ts";

import type {RendererProps} from "./renderers.types.ts";

type LocalOverrides = {
    ref?: RefObject<HTMLInputElement | null>,
    className?: string,
    validator?: Predicate<string>,
    autoComplete?: boolean,
    onUpdate?: Consumer<boolean>,
}
export type BooleanRendererProps = Omit<RendererProps, keyof LocalOverrides> & LocalOverrides;

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
        value: value?.toString(),
        className: joinCss(styles.renderer, styles.boolean, styles.active, className),
        // "switch" is weeded out, but format == switch is handled later on.
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
        <StatefulInput {...overrides} ref={ref} type={type} />
    );
}
