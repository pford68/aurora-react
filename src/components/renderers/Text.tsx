import type {ReactElement} from "react";
import type {Predicate} from "../../types/types.ts";
import {joinCss} from "../../util/utils.ts";
import styles from "./Renderers.module.css";

export type TextProps = {
    value: unknown,
    className?: string,
    validator?: Predicate<string>,
}

export default function Text(props: TextProps): ReactElement {
    const {value, className, validator} = props;
    const finalClass = joinCss(
        !(validator?.(String(value)) ?? true) ? styles.invalid :  "",
        className,
    )

    return <div className={finalClass}>{String(value)}</div>
}
