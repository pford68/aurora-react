import type {ReactElement, MouseEvent} from "react";
import type {Command, Consumer} from "../../types/types.ts";
import Overlay from "./Overlay.tsx";
import MenuItem from "./MenuItem.tsx";
import {joinCss} from "../../util/utils.ts";
import styles from "./menus.module.css";

type MenuProps = {
    commands: Command<unknown>[],
    visible: boolean,
    top: number,
    left: number,
    onClick?: Consumer<MouseEvent>,
    className?: string,
}

export default function Menu(props: MenuProps): ReactElement {
    const {
        commands,
        className,
        visible,
        top,
        left,
        onClick,
    } = props;

    const popupProps = {
        visible,
        top,
        left,
    }


    return (
        <Overlay
            {...popupProps}
            className={joinCss(styles.menu, className)}
            noContextMenu
        >
            <section onClick={onClick}>
                {commands.map((c, index) => {
                    return <MenuItem key={index} command={c}/>;
                })}
            </section>
        </Overlay>
    );
}
