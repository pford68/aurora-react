import React, {type ReactElement, type ReactNode, useState} from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./Input.module.css";

export type InputType =
    "text" |
    "checkbox" |
    "radio" |
    "color" |
    "number" |
    "email" |
    "tel" |
    "url" |
    "date" |
    "time" |
    "datetime-local" |
    "range" |
    "month" |
    "week" |
    "search" |
    "file" |
    "password" |
    "hidden"
    ;

export type Alignment = "left" | "right" | "top" | "bottom";


export type InputProps = {
    name: string,
    value?: string | number | undefined,
    type?: InputType,
    validator?: (value:string) => boolean,
    id?: string,
    className?: string,
    required?: boolean,
    onChange?: (e:React.ChangeEvent<HTMLInputElement>) => void,
    onFocus?: (e:React.FocusEvent<HTMLInputElement>) => void,
    onBlur?: (e:React.FocusEvent<HTMLInputElement>) => void,
    placeholder?: string,
    pattern?: string,
    maxLength?: number,
    list?: string,
    autoComplete?: "on" | "off",
    checked?: boolean,
    readOnly?: boolean,
    textOnly?: boolean,
};

export type LabelFormat =
    "colon" |
    undefined;


export type LabelProps = {
    text: string,
    children: ReactNode | ReactNode[],
    align?: Alignment,
    labelFormat?: LabelFormat,
    className?: string,
};

export type LabeledInputProps = InputProps & {
    text: string,
    align?: Alignment,
    labelFormat?: LabelFormat,
} ;


const formatLabel = (label: string, format: LabelFormat): string => {
    switch(format) {
        case "colon":
            return `${label}:`;
        default:
            return label;
    }
}


export function Label(props: LabelProps): ReactElement {
    const {
        text,
        align = "left",
        labelFormat,
        children,
    } = props;

    return (
        <div className={styles.container}>
            <label className={joinCss(styles.label, styles[align] ?? "")}>
                <span>{formatLabel(text, labelFormat)}</span>
                {children}
            </label>
        </div>
    );
}


export function LabeledInput(props: LabeledInputProps): ReactElement {
    const {
        text,
        align = "left",
        labelFormat,
    } = props;

    const fProps = {...props, text: undefined};
    delete fProps.labelFormat;
    delete fProps.align;

    return (
        <Label text={text} align={align} labelFormat={labelFormat}>
            <Input {...fProps} />
        </Label>
    );
}


export default function Input(props: InputProps): ReactElement {

    const fProps = {...props};
    const {textOnly, value} = fProps;
    delete fProps.textOnly;
    const [visited, setVisited] = useState(false);

    if (textOnly === true) {
        return <span>{value}</span>
    }

    return (
        <input
            {...fProps}
            onFocus={(e) => {
                setVisited(true);
                props.onFocus?.(e)
            }}
            className={joinCss(styles.input, visited ? styles.visited : "", props.className)}
        />
    )
}

