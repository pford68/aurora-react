import type {RendererProps} from "./types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import Text from "./Text.tsx";
import {type ComponentType} from "react";


export default function withReadonlyMode<T, U extends RendererProps<T>>(WrappedComponent:ComponentType<U>): ComponentType<U> {
    return function(props: RendererProps<T> ) {
        const {className, active = false, value, validator} = props;
        const baseClassName = joinCss(styles.renderer, styles.text, className);

        if (!active) {
            return <Text value={value as T} className={baseClassName} validator={validator}/>;
        }

        return <WrappedComponent {...props as U} />
    }
}