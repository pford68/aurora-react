import {type ReactElement, type MouseEvent, useRef} from "react";
import type {Command, Consumer} from "../../types/types.ts";
import Overlay from "./Overlay.tsx";
import MenuItem from "./MenuItem.tsx";
import {joinCss} from "../../util/utils.ts";
import styles from "./menus.module.css";
import useNormalizedPosition from "../../hooks/useNormalizedPosition.tsx";

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

    const contentRef = useRef<HTMLDivElement | null>(null)

    useNormalizedPosition(contentRef, {top, left}, {left: 0, top: 0});

    return (
        <Overlay
            visible={visible}
            noContextMenu
        >
            <div
                role="menu"
                ref={contentRef}
                onClick={onClick}
                className={joinCss(styles.popup, styles.menu, className)}
                style={{top: `${top}px`, left: `${left}px`}}
            >
                {commands.map((c, index) => {
                    return <MenuItem key={index} command={c}/>;
                })}
            </div>
        </Overlay>
    );
}
