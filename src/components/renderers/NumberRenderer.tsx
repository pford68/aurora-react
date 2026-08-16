import React from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {RendererProps} from "./types.ts";
import StatefulInput from "./StatefulInput.tsx";

export type NumericProps = RendererProps<number> & {
    precision?: number,
};
export default function NumberRenderer(props: NumericProps): React.ReactElement {
    const {
        name,
        precision,
        value,
        rendererRef,
        className,
        readOnly,
    } = props;
    const numericValue = value != null ? Number(value) : null;
    const formattedValue = precision != null ? numericValue?.toFixed?.(precision) : value;
    const nextProps = {
        name,
        readOnly,
        value: String(formattedValue),
        className: joinCss(styles.renderer, styles.numeric, styles.active, className),
    };

    return (
        <StatefulInput {...nextProps} ref={rendererRef} type="number"/>
    );
}
