import React from "react";
import StatefulInput from "./StatefulInput.tsx";
import type {RendererProps} from "./types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";


export type StringProps = RendererProps<string> & {
    autoComplete?: boolean,
};

export default function StringRenderer(props: StringProps): React.ReactElement {
    const {
        name,
        value,
        rendererRef,
        className,
    } = props;

    const nextProps = {
        ...props,
        name,
        value,
        placeholder: String(props.placeholder),
        className: joinCss(styles.renderer, styles.text, styles.active, className),
    }

    return <StatefulInput {...nextProps} ref={rendererRef} type="text"/>;
}
