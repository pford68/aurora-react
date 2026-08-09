import React from "react";
import StatefulInput from "./StatefulInput";
import type {BaseRendererProps} from "./types";
import {COMMON_DEFAULT_PROPS} from "../constants";
import Text from "./Text";
import {joinCss} from "../../../util/utils";
import styles from "./Renderers.module.css";


export type StringProps = BaseRendererProps<string> & {
    autoComplete?: boolean,
};

export default function StringRenderer(props: StringProps): React.ReactElement {
    const {
        name,
        active,
        value,
        rendererRef,
        className,
        validator,
    } = props;

    const baseClassName = joinCss(styles.renderer, styles.text, className);

    const nextProps = {
        ...props,
        name,
        value: value != null ? String(value) : undefined,
        placeholder: String(props.placeholder),
        className: joinCss(baseClassName, styles.active),
    }

    if (!active) {
        return <Text value={value} className={baseClassName} validator={validator} />;
    }

    return <StatefulInput {...nextProps} ref={rendererRef} type="text"/>;
}

StringRenderer.defaultProps = {
    ...COMMON_DEFAULT_PROPS,
    placeholder: "",
}