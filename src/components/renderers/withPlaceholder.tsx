import type {RendererProps} from "./types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import Text from "./Text.tsx";
import {type ComponentType} from "react";


export default function withPlaceholder<P extends RendererProps<unknown>>(WrappedComponent:ComponentType<P>): ComponentType<P> {
    return function(props: P) {
        const {className, active = false, placeholder = "NULL", value, validator} = props;
        const baseClassName = joinCss(styles.renderer, styles.text, className);

        if (value == null && !active) {
            return (
                <Text
                    value={placeholder}
                    className={joinCss(baseClassName, styles.null)}
                    validator={validator}
                />
            );
        }

        return <WrappedComponent {...props as P} />
    }
}