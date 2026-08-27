import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";
import Text from "../forms/Text.tsx";
import {type ComponentType} from "react";
import type {RendererProps} from "./Datagrid.types.ts";
import {isEmpty} from "../../util/validations.ts";


export default function withPlaceholder(WrappedComponent:ComponentType<RendererProps>): ComponentType<RendererProps> {
    return function(props: RendererProps) {
        const {className, active = false, placeholder = "NULL", value, validator} = props;
        const baseClassName = joinCss(styles.renderer, styles.text, className);

        const valueOf = value?.valueOf();
        if (isEmpty(valueOf) && !active) {
            return (
                <Text
                    value={placeholder}
                    className={joinCss(baseClassName, styles.null)}
                    validator={validator}
                />
            );
        }

        return <WrappedComponent {...props} />
    }
}