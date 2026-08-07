import React, {type ReactElement, useState} from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Input.module.css";

export type MultilineProps = {
    name: string,
    value?: string | undefined,
    validator?: (value:string) => boolean,
    id?: string,
    className?: string,
    required?: boolean,
    onChange?: (e:React.ChangeEvent<HTMLTextAreaElement>) => void,
    onFocus?: (e:React.FocusEvent<HTMLTextAreaElement>) => void,
    onBlur?: (e:React.FocusEvent<HTMLTextAreaElement>) => void,
    placeholder?: string,
    readOnly?: boolean,
    maxLength?: number,
}

export default function Multiline(props: MultilineProps): ReactElement {

    const [visited, setVisited] = useState(false);

    return (
        <textarea
            {...props}
            onFocus={(e) => {
                setVisited(true);
                props.onFocus?.(e)
            }}
            className={joinCss(
                styles.input,
                styles.multiline,
                visited ? styles.visited : "", props.className
            )}
        />
    )
}
