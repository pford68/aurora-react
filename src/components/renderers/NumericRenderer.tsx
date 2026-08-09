import React from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import type {BaseRendererProps} from "./types.ts";
import {COMMON_DEFAULT_PROPS} from "../datagrid/constants.ts";
import StatefulInput from "./StatefulInput.tsx";
import Text from "./Text.tsx";

export type NumericProps = BaseRendererProps<number> & {
    precision?: number,
};
export default function NumericRenderer(props: NumericProps): React.ReactElement {
    const {
        name,
        precision,
        value,
        active,
        rendererRef,
        className,
        validator,
        readOnly,
    } = props;
    const baseClassName = joinCss(styles.renderer, styles.numeric, className);
    const numericValue = value != null ? Number(value) : null;
    const formattedValue = precision != null ? numericValue?.toFixed?.(precision) : value;
    const nextProps = {
        name,
        readOnly,
        value: String(formattedValue),
        className: joinCss(baseClassName, styles.active),
    };

    if (!active) {
        return (
            <Text
                value={value}
                className={joinCss(baseClassName, styles.inactive)}
                validator={validator}
            />
        );
    }

    return (
        <StatefulInput {...nextProps} ref={rendererRef} type="number"/>
    );
}
NumericRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
}