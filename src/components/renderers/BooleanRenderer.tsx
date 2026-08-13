import React from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {RendererProps} from "./types.ts";
import StatefulInput from "./StatefulInput.tsx";

export type BooleanRendererProps = RendererProps<boolean> & {
    value: boolean,
    format: "checkbox" | "switch" | "text",
};

export default function BooleanRenderer(props: BooleanRendererProps): React.ReactElement {
    const {
        name,
        rendererRef,
        className,
        value,
        format,
    } = props;

    const overrides = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(styles.renderer, styles.boolean, styles.active, className),
        // "switch" is weeded out, but format == switch is handled later on.
        type: format,
        checked: value === true,
    };

    if (format === "switch") {
        return (
            <label className={styles.switch}>
                <StatefulInput {...overrides} ref={rendererRef} type="checkbox" />
                <span className={joinCss(styles.slider, styles.round)}></span>
            </label>
        )
    }

    const finalFormat = format === "text" || format === "checkbox" ? format : "checkbox";

    return (
        <StatefulInput {...overrides} ref={rendererRef} type={finalFormat}/>
    );
}

BooleanRenderer.defaultProps = {
    value: false,
}
