import {type ReactElement} from "react";
import type {Command} from "../../types/types.ts";
import styles from "./overlays.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type MenuItemProps= {
    command: Command,
}

export default function MenuItem({command}: MenuItemProps): ReactElement {

    return (
        <div
            className={styles.menuItem}
            onClick={command.execute}
        >
            <span className={styles.left}>
                <span className={styles.icon}>
                    {
                        typeof command.icon == "string"
                            ? <FontAwesomeIcon icon={command.icon} />
                            : ""
                    }
                </span>
                <span>{command.name}</span>
            </span>
            <span className={styles.accelerator}>{command.accelerator}</span>
        </div>
    )
}