import {type ReactNode, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import styles from "./menus.module.css";
import {joinCss} from "../../util/utils.ts";


type OverlayProps = {
    /** (Boolean)  Whether to display the entire overlay */
    visible: boolean,
    /** The content of the overlay, if any */
    children: ReactNode | ReactNode[],
    left?: number,
    noContextMenu?: boolean,
    className?: string;
    modal?: boolean,
    /**
     * (Boolean) Whether to put the content in the center of the screen
     * Will override top/left.
     */
    center?: boolean,
}

/**
 * This component should always be on top, so it attaches to document.body.
 *
 * @param props
 * @constructor
 */
export default function Overlay(props: OverlayProps): ReactNode | ReactNode[] {
    const {
        visible,
        children,
        noContextMenu = true,
        modal = true,
        center = false,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (noContextMenu && ref.current) {
            const onContextMenu = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }
            ref.current?.addEventListener("contextmenu", onContextMenu);


            return () => {
                ref.current?.removeEventListener("contextmenu", onContextMenu);
            }
        }
    }, []);



    if (visible && document.body != null) {
        return createPortal((
            <div
                className={joinCss(
                    styles.layer,
                    !modal ? styles.nonModal : "",
                    center === true ? styles.center : "",
                )}
            >
                {children}
            </div>
        ), document.body);
    }
    return "";
}

