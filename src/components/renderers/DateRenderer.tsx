import React from "react";
import {joinCss, toISODateString} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {RendererProps} from "./types.ts";
import Text from "./Text.tsx";
import StatefulInput from "./StatefulInput.tsx";

export type DateRendererProps = RendererProps<number> & Record<string, never> & {
    addTime: boolean,
};

export default function DateRenderer(props: DateRendererProps): React.ReactElement {
    const {
        name,
        value,
        active,
        className,
        validator,
        addTime,
        rendererRef,
        readonly
    } = props;

    const baseClassName = joinCss(styles.renderer, styles.date, className);

    const nextProps = {
        name,
        readonly,
        className: joinCss(baseClassName, styles.active),
    };

    const formattedValue = addTime ? new Date(Number(value)).toISOString() : toISODateString(Number(value))

    if (!active) {
        return <Text value={formattedValue} className={baseClassName} validator={validator} />;
    }

    return (
        <StatefulInput {...nextProps} type="date" ref={rendererRef} value={formattedValue} />
    );
}
DateRenderer.defaultProps = {
    addTime: false,
}


