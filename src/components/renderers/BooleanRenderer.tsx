import React from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {BaseRendererProps} from "./types.ts";
import StatefulInput from "./StatefulInput.tsx";
import Text from "./Text.tsx";

export type BooleanRendererProps = BaseRendererProps<boolean> & {
    value: boolean,
    format: "checkbox" | "switch" | "text",
};

export default function BooleanRenderer(props: BooleanRendererProps): React.ReactElement {
    const {
        name,
        rendererRef,
        className,
        value,
        active,
        format,
        validator,
    } = props;

    const baseClassName = joinCss(styles.renderer, styles.boolean, className);

    const overrides = {
        name,
        value: (value === true ? "true" : "false"),
        className: joinCss(baseClassName, styles.active),
        // "switch" is weeded out, but format == switch is handled later on.
        type: format,
        checked: value === true,
    };

    if (!active) {
        return <Text value={value} className={baseClassName} validator={validator} />;
    }

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
