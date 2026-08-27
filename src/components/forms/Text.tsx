import type {ReactElement} from "react";
import type {Predicate} from "../../types/types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "../datagrid/Renderers.module.css";

export type TextProps<T> = {
    value: T,
    className?: string,
    validator?: Predicate<T>,
}

export default function Text<T>(props: TextProps<T>): ReactElement {
    const {value, className, validator} = props;
    const finalClass = joinCss(
        !(validator?.(value) ?? true) ? styles.invalid :  "",
        className,
    )

    return <div className={finalClass}>{String(value)}</div>
}
