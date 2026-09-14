import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import Text from "../forms/Text.tsx";
import {type ComponentType} from "react";

import type {RendererProps} from "./Datagrid.types.ts";


export default function withReadonlyMode(WrappedComponent:ComponentType<RendererProps>): ComponentType<RendererProps> {
    return function(props: RendererProps) {
        const {className, active = false, value, validator} = props;
        const baseClassName = joinCss(styles.renderer, styles.text, className);

        if (!active) {
            return <Text value={String(value)} className={baseClassName} validator={validator}/>;
        }

        return <WrappedComponent {...props} />
    }
}