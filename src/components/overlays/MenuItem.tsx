import {type MouseEventHandler, type ReactElement} from "react";
import styles from "./overlays.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";

type MenuItemProps= {
    name: string,
    accelerator?: string,
    icon?: IconProp,
    execute: MouseEventHandler
}

export default function MenuItem(props: MenuItemProps): ReactElement {
    const {name, execute, accelerator, icon} = props;
    return (
        <div
            className={styles.menuItem}
            onClick={execute}
        >
            <span className={styles.left}>
                <span className={styles.icon}>
                    {
                        typeof icon == "string"
                            ? <FontAwesomeIcon icon={icon} />
                            : ""
                    }
                </span>
                <span>{name}</span>
            </span>
            <span className={styles.accelerator}>{accelerator}</span>
        </div>
    )
}