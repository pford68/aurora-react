import type {MouseEventHandler} from "react";
import styles from "./CloseButton.module.css";

type CloseButtonProps = {
    onClick: MouseEventHandler,
}

export default function CloseButton(props: CloseButtonProps) {
    return (
        <button {...props} className={styles.close}></button>
    )
}