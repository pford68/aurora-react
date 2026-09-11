import {type ReactElement, type MouseEvent, useRef} from "react";
import type {Consumer} from "../../types/types.ts";
import Overlay from "./Overlay.tsx";
import {joinCss} from "../../util/utils.ts";
import styles from "./overlays.module.css";
import useNormalizedPosition from "../../hooks/useNormalizedPosition.tsx";

type MenuProps = {
    children: ReactElement | ReactElement[],
    visible: boolean,
    top: number,
    left: number,
    onClick?: Consumer<MouseEvent>,
    className?: string,
}

export default function Menu(props: MenuProps): ReactElement {
    const {
        children,
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
            modal={true}
            noContextMenu
            className={styles.transparent}
        >
            <div
                role="menu"
                ref={contentRef}
                onClick={onClick}
                className={joinCss(styles.popup, styles.menu, className)}
                style={{top: `${top}px`, left: `${left}px`}}
            >
                {children}
            </div>
        </Overlay>
    );
}
