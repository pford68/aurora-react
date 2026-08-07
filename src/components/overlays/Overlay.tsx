import {type ReactNode, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import styles from "./overlays.module.css";
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
        className,
    } = props;

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (noContextMenu && ref.current) {
            const domNode = ref.current;
            const onContextMenu = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }
           domNode.addEventListener("contextmenu", onContextMenu);


            return () => {
                domNode?.removeEventListener("contextmenu", onContextMenu);
            }
        }
    }, [visible, noContextMenu]);



    if (visible && document.body != null) {
        return createPortal((
            <div
                ref={ref}
                className={joinCss(
                    styles.layer,
                    !modal ? styles.nonModal : "",
                    center === true ? styles.center : "",
                    className
                )}
            >
                {children}
            </div>
        ), document.body);
    }
    return "";
}

