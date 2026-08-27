import React, {type RefObject} from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "../datagrid/Renderers.module.css";
import type {Predicate} from "../../types/types.ts";
import type {RendererProps} from "../datagrid/Datagrid.types.ts";


type LocalOverrides = {
    ref?: RefObject<HTMLInputElement | null>,
    className?: string,
    validator?: Predicate<string>,
    autoComplete?: boolean,
    type?: string,
}
export type BooleanRendererProps = Omit<RendererProps, keyof LocalOverrides> & LocalOverrides;

export default function Toggle(props: BooleanRendererProps): React.ReactElement {
    const {
        name,
        ref,
        className,
        value,
        type,
    } = props;


    const overrides = {
        name,
        defaultChecked: value?.toString() === "true",
        className: joinCss(styles.renderer, styles.boolean, styles.active, className),
    };

    if (type === "switch") {
        return (
            <label className={styles.switch}>
                <input {...overrides} ref={ref} type="checkbox" />
                <span className={joinCss(styles.slider, styles.round)}></span>
            </label>
        )
    }

    return (
        <input {...overrides} ref={ref} type="checkbox" />
    );
}

