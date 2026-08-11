import React from "react";
import StatefulInput from "./StatefulInput.tsx";
import type {RendererProps} from "./types.ts";
import {COMMON_DEFAULT_PROPS} from "../datagrid/constants.ts";
import Text from "./Text.tsx";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";


export type StringProps = RendererProps<string> & {
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
        value,
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